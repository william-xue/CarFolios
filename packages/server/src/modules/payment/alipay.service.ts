import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'

// 支付宝支付参数接口
export interface AlipayParams {
    outTradeNo: string       // 商户订单号
    subject: string          // 订单标题
    amount: number           // 金额(分)
    notifyUrl?: string       // 回调地址
    returnUrl?: string       // 同步跳转地址
}

// 支付宝订单查询结果
export interface AlipayOrderResult {
    trade_status: string     // 交易状态
    trade_no?: string        // 支付宝交易号
    out_trade_no: string     // 商户订单号
    total_amount?: string    // 交易金额
    buyer_logon_id?: string  // 买家支付宝账号
    gmt_payment?: string     // 交易付款时间
}

// 支付宝退款参数
export interface AlipayRefundParams {
    outTradeNo: string       // 原商户订单号
    outRequestNo: string     // 退款请求号
    refundAmount: number     // 退款金额(分)
    refundReason?: string    // 退款原因
}

// 支付宝退款结果
export interface AlipayRefundResult {
    trade_no: string         // 支付宝交易号
    out_trade_no: string     // 商户订单号
    refund_fee: string       // 退款金额
    fund_change: string      // 资金变化方向
}

@Injectable()
export class AlipayService {
    private readonly logger = new Logger(AlipayService.name)

    // 支付宝配置
    private appId: string
    private privateKey: string
    private alipayPublicKey: string
    private notifyUrl: string
    private returnUrl: string

    // 支付宝网关
    private readonly gateway = 'https://openapi.alipay.com/gateway.do'

    constructor(private configService: ConfigService) {
        this.loadConfig()
    }

    /**
     * 加载支付宝配置
     */
    private loadConfig() {
        this.appId = this.configService.get<string>('ALIPAY_APP_ID', '')
        this.privateKey = this.configService.get<string>('ALIPAY_PRIVATE_KEY', '')
        this.alipayPublicKey = this.configService.get<string>('ALIPAY_PUBLIC_KEY', '')
        this.notifyUrl = this.configService.get<string>('ALIPAY_NOTIFY_URL', '')
        this.returnUrl = this.configService.get<string>('ALIPAY_RETURN_URL', '')

        if (!this.appId || !this.privateKey) {
            this.logger.warn('支付宝配置不完整，部分功能可能无法使用')
        }
    }

    /**
     * 生成 RSA2 签名
     * @param params 待签名参数
     */
    generateSignature(params: Record<string, string>): string {
        // 1. 过滤空值和 sign 参数
        const filteredParams = Object.entries(params)
            .filter(([key, value]) => key !== 'sign' && value !== '' && value !== undefined)
            .sort(([a], [b]) => a.localeCompare(b))

        // 2. 拼接成待签名字符串
        const signStr = filteredParams
            .map(([key, value]) => `${key}=${value}`)
            .join('&')

        // 3. 使用私钥进行 SHA256WithRSA 签名
        const sign = crypto.createSign('RSA-SHA256')
        sign.update(signStr, 'utf8')
        return sign.sign(this.formatPrivateKey(this.privateKey), 'base64')
    }

    /**
     * 验证回调签名
     */
    verifyCallback(params: Record<string, string>): boolean {
        try {
            const sign = params.sign
            const signType = params.sign_type

            if (!sign || signType !== 'RSA2') {
                this.logger.warn('回调签名验证失败：签名或签名类型无效')
                return false
            }

            // 过滤 sign 和 sign_type 参数
            const filteredParams = Object.entries(params)
                .filter(([key]) => key !== 'sign' && key !== 'sign_type')
                .sort(([a], [b]) => a.localeCompare(b))

            // 拼接待验签字符串
            const signStr = filteredParams
                .map(([key, value]) => `${key}=${value}`)
                .join('&')

            // 使用支付宝公钥验证签名
            const verify = crypto.createVerify('RSA-SHA256')
            verify.update(signStr, 'utf8')
            return verify.verify(this.formatPublicKey(this.alipayPublicKey), sign, 'base64')
        } catch (error) {
            this.logger.error('回调签名验证异常', error)
            return false
        }
    }

    /**
     * 创建手机网站支付（WAP）
     * 返回支付表单 HTML
     */
    async createWapPayment(params: AlipayParams): Promise<string> {
        const bizContent = {
            out_trade_no: params.outTradeNo,
            total_amount: (params.amount / 100).toFixed(2), // 分转元
            subject: params.subject,
            product_code: 'QUICK_WAP_WAY',
        }

        const requestParams = this.buildRequestParams('alipay.trade.wap.pay', bizContent, {
            notify_url: params.notifyUrl || this.notifyUrl,
            return_url: params.returnUrl || this.returnUrl,
        })

        // 生成自动提交的表单
        return this.buildFormHtml(requestParams)
    }

    /**
     * 创建电脑网站支付（PC）
     * 返回支付页面 URL
     */
    async createPagePayment(params: AlipayParams): Promise<string> {
        const bizContent = {
            out_trade_no: params.outTradeNo,
            total_amount: (params.amount / 100).toFixed(2), // 分转元
            subject: params.subject,
            product_code: 'FAST_INSTANT_TRADE_PAY',
        }

        const requestParams = this.buildRequestParams('alipay.trade.page.pay', bizContent, {
            notify_url: params.notifyUrl || this.notifyUrl,
            return_url: params.returnUrl || this.returnUrl,
        })

        // 构建跳转 URL
        const queryString = Object.entries(requestParams)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&')

        return `${this.gateway}?${queryString}`
    }

    /**
     * 查询订单
     */
    async queryOrder(outTradeNo: string): Promise<AlipayOrderResult> {
        const bizContent = {
            out_trade_no: outTradeNo,
        }

        const requestParams = this.buildRequestParams('alipay.trade.query', bizContent)
        const response = await this.request(requestParams)

        return response.alipay_trade_query_response
    }

    /**
     * 申请退款
     */
    async refund(params: AlipayRefundParams): Promise<AlipayRefundResult> {
        const bizContent = {
            out_trade_no: params.outTradeNo,
            out_request_no: params.outRequestNo,
            refund_amount: (params.refundAmount / 100).toFixed(2), // 分转元
            refund_reason: params.refundReason,
        }

        const requestParams = this.buildRequestParams('alipay.trade.refund', bizContent)
        const response = await this.request(requestParams)

        return response.alipay_trade_refund_response
    }

    /**
     * 构建请求参数
     */
    private buildRequestParams(
        method: string,
        bizContent: Record<string, any>,
        extraParams?: Record<string, string>,
    ): Record<string, string> {
        const params: Record<string, string> = {
            app_id: this.appId,
            method,
            format: 'JSON',
            charset: 'utf-8',
            sign_type: 'RSA2',
            timestamp: this.formatTimestamp(new Date()),
            version: '1.0',
            biz_content: JSON.stringify(bizContent),
            ...extraParams,
        }

        // 生成签名
        params.sign = this.generateSignature(params)

        return params
    }

    /**
     * 发送请求
     */
    private async request(params: Record<string, string>): Promise<any> {
        const queryString = Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&')

        const response = await fetch(`${this.gateway}?${queryString}`, {
            method: 'GET',
        })

        const data = await response.json()

        // 检查响应中的错误
        const responseKey = Object.keys(data).find(key => key.endsWith('_response'))
        if (responseKey) {
            const responseData = data[responseKey]
            if (responseData.code && responseData.code !== '10000') {
                const error = new Error(responseData.sub_msg || responseData.msg || '支付宝接口调用失败')
                    ; (error as any).code = responseData.code
                    ; (error as any).subCode = responseData.sub_code
                    ; (error as any).response = responseData
                throw error
            }
        }

        return data
    }

    /**
     * 构建自动提交的表单 HTML
     */
    private buildFormHtml(params: Record<string, string>): string {
        const inputs = Object.entries(params)
            .map(([key, value]) => `<input type="hidden" name="${key}" value="${this.escapeHtml(value)}" />`)
            .join('\n')

        return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>正在跳转到支付宝...</title>
</head>
<body>
  <form id="alipayForm" action="${this.gateway}" method="POST">
    ${inputs}
  </form>
  <script>document.getElementById('alipayForm').submit();</script>
</body>
</html>`
    }

    /**
     * 格式化私钥（添加 PEM 头尾）
     */
    private formatPrivateKey(key: string): string {
        if (key.includes('-----BEGIN')) return key
        return `-----BEGIN RSA PRIVATE KEY-----\n${key}\n-----END RSA PRIVATE KEY-----`
    }

    /**
     * 格式化公钥（添加 PEM 头尾）
     */
    private formatPublicKey(key: string): string {
        if (key.includes('-----BEGIN')) return key
        return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`
    }

    /**
     * 格式化时间戳
     */
    private formatTimestamp(date: Date): string {
        const pad = (n: number) => n.toString().padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    /**
     * HTML 转义
     */
    private escapeHtml(str: string): string {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
    }

    /**
     * 映射支付宝错误码到用户友好提示
     */
    mapErrorToUserMessage(subCode: string): string {
        const errorMap: Record<string, string> = {
            'ACQ.SYSTEM_ERROR': '系统繁忙，请稍后重试',
            'ACQ.INVALID_PARAMETER': '参数错误，请检查支付信息',
            'ACQ.TRADE_HAS_SUCCESS': '订单已支付',
            'ACQ.TRADE_HAS_CLOSE': '订单已关闭',
            'ACQ.BUYER_BALANCE_NOT_ENOUGH': '余额不足',
            'ACQ.BUYER_BANKCARD_BALANCE_NOT_ENOUGH': '银行卡余额不足',
            'ACQ.TRADE_NOT_EXIST': '交易不存在',
            'ACQ.TRADE_STATUS_ERROR': '交易状态异常',
            'ACQ.SELLER_BALANCE_NOT_ENOUGH': '商户余额不足',
            'ACQ.REFUND_AMT_NOT_EQUAL_TOTAL': '退款金额超限',
        }

        return errorMap[subCode] || '支付失败，请稍后重试'
    }
}
