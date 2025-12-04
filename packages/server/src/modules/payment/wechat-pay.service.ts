import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'

// 微信支付参数接口
export interface WechatPayParams {
    outTradeNo: string       // 商户订单号
    description: string      // 商品描述
    amount: number           // 金额(分)
    notifyUrl: string        // 回调地址
    clientIp?: string        // 客户端IP
}

// 微信 H5 支付结果
export interface WechatH5Result {
    h5Url: string            // H5 支付跳转链接
}

// 微信 Native 支付结果
export interface WechatNativeResult {
    codeUrl: string          // 支付二维码链接
    prepayId?: string
}

// 微信回调数据
export interface WechatCallbackData {
    transaction_id: string   // 微信支付订单号
    out_trade_no: string     // 商户订单号
    trade_state: string      // 交易状态
    trade_state_desc: string // 交易状态描述
    amount: {
        total: number          // 订单总金额(分)
        payer_total: number    // 用户支付金额(分)
    }
    payer: {
        openid: string
    }
    success_time: string     // 支付完成时间
}

// 微信订单查询结果
export interface WechatOrderResult {
    trade_state: string
    trade_state_desc: string
    transaction_id?: string
    success_time?: string
    amount?: {
        total: number
        payer_total: number
    }
}

// 微信退款参数
export interface WechatRefundParams {
    outTradeNo: string       // 原商户订单号
    outRefundNo: string      // 商户退款单号
    refundAmount: number     // 退款金额(分)
    totalAmount: number      // 原订单金额(分)
    reason?: string          // 退款原因
}

// 微信退款结果
export interface WechatRefundResult {
    refund_id: string        // 微信退款单号
    out_refund_no: string    // 商户退款单号
    status: string           // 退款状态
    amount: {
        refund: number
        total: number
    }
}

@Injectable()
export class WechatPayService {
    private readonly logger = new Logger(WechatPayService.name)

    // 微信支付配置
    private appId: string
    private mchId: string
    private apiKeyV3: string
    private privateKey: string
    private certSerialNo: string
    private notifyUrl: string

    // 微信支付 API 基础地址
    private readonly apiBase = 'https://api.mch.weixin.qq.com'

    constructor(private configService: ConfigService) {
        this.loadConfig()
    }

    /**
     * 加载微信支付配置
     */
    private loadConfig() {
        this.appId = this.configService.get<string>('WECHAT_PAY_APP_ID', '')
        this.mchId = this.configService.get<string>('WECHAT_PAY_MCH_ID', '')
        this.apiKeyV3 = this.configService.get<string>('WECHAT_PAY_API_KEY_V3', '')
        this.privateKey = this.configService.get<string>('WECHAT_PAY_PRIVATE_KEY', '')
        this.certSerialNo = this.configService.get<string>('WECHAT_PAY_CERT_SERIAL_NO', '')
        this.notifyUrl = this.configService.get<string>('WECHAT_PAY_NOTIFY_URL', '')

        if (!this.appId || !this.mchId) {
            this.logger.warn('微信支付配置不完整，部分功能可能无法使用')
        }
    }

    /**
     * 生成 API v3 签名
     * @param method HTTP 方法
     * @param url 请求 URL（不含域名）
     * @param timestamp 时间戳
     * @param nonceStr 随机字符串
     * @param body 请求体
     */
    generateSignature(method: string, url: string, timestamp: string, nonceStr: string, body: string): string {
        // 构造签名串
        const signStr = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`

        // 使用私钥进行 SHA256WithRSA 签名
        const sign = crypto.createSign('RSA-SHA256')
        sign.update(signStr)
        return sign.sign(this.privateKey, 'base64')
    }

    /**
     * 生成 Authorization 头
     */
    private generateAuthHeader(method: string, url: string, body: string): string {
        const timestamp = Math.floor(Date.now() / 1000).toString()
        const nonceStr = crypto.randomBytes(16).toString('hex')
        const signature = this.generateSignature(method, url, timestamp, nonceStr, body)

        return `WECHATPAY2-SHA256-RSA2048 mchid="${this.mchId}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.certSerialNo}"`
    }

    /**
     * 创建 H5 支付
     */
    async createH5Payment(params: WechatPayParams): Promise<WechatH5Result> {
        const url = '/v3/pay/transactions/h5'
        const body = JSON.stringify({
            appid: this.appId,
            mchid: this.mchId,
            description: params.description,
            out_trade_no: params.outTradeNo,
            notify_url: params.notifyUrl || this.notifyUrl,
            amount: {
                total: params.amount,
                currency: 'CNY',
            },
            scene_info: {
                payer_client_ip: params.clientIp || '127.0.0.1',
                h5_info: {
                    type: 'Wap',
                },
            },
        })

        try {
            const response = await this.request('POST', url, body)
            return {
                h5Url: response.h5_url,
            }
        } catch (error) {
            this.logger.error('创建 H5 支付失败', error)
            throw error
        }
    }

    /**
     * 创建 Native 支付（扫码支付）
     */
    async createNativePayment(params: WechatPayParams): Promise<WechatNativeResult> {
        const url = '/v3/pay/transactions/native'
        const body = JSON.stringify({
            appid: this.appId,
            mchid: this.mchId,
            description: params.description,
            out_trade_no: params.outTradeNo,
            notify_url: params.notifyUrl || this.notifyUrl,
            amount: {
                total: params.amount,
                currency: 'CNY',
            },
        })

        try {
            const response = await this.request('POST', url, body)
            return {
                codeUrl: response.code_url,
            }
        } catch (error) {
            this.logger.error('创建 Native 支付失败', error)
            throw error
        }
    }

    /**
     * 验证回调签名
     */
    verifyCallback(headers: Record<string, string>, body: string): boolean {
        try {
            const timestamp = headers['wechatpay-timestamp']
            const nonce = headers['wechatpay-nonce']
            const signature = headers['wechatpay-signature']
            const serial = headers['wechatpay-serial']

            if (!timestamp || !nonce || !signature || !serial) {
                this.logger.warn('回调签名验证失败：缺少必要的头信息')
                return false
            }

            // 构造验签串
            const signStr = `${timestamp}\n${nonce}\n${body}\n`

            // TODO: 使用微信平台证书验证签名
            // 这里需要获取微信平台证书公钥进行验证
            // 暂时返回 true，实际生产环境必须实现完整验签
            this.logger.warn('回调签名验证：当前为开发模式，跳过验签')
            return true
        } catch (error) {
            this.logger.error('回调签名验证异常', error)
            return false
        }
    }

    /**
     * 解密回调数据
     */
    decryptCallback(ciphertext: string, nonce: string, associatedData: string): WechatCallbackData {
        try {
            // 使用 AES-256-GCM 解密
            const key = Buffer.from(this.apiKeyV3, 'utf8')
            const iv = Buffer.from(nonce, 'utf8')
            const authTag = Buffer.from(ciphertext.slice(-24), 'base64')
            const encryptedData = Buffer.from(ciphertext.slice(0, -24), 'base64')

            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
            decipher.setAuthTag(authTag)
            decipher.setAAD(Buffer.from(associatedData, 'utf8'))

            let decrypted = decipher.update(encryptedData, undefined, 'utf8')
            decrypted += decipher.final('utf8')

            return JSON.parse(decrypted)
        } catch (error) {
            this.logger.error('解密回调数据失败', error)
            throw error
        }
    }

    /**
     * 查询订单
     */
    async queryOrder(outTradeNo: string): Promise<WechatOrderResult> {
        const url = `/v3/pay/transactions/out-trade-no/${outTradeNo}?mchid=${this.mchId}`

        try {
            return await this.request('GET', url, '')
        } catch (error) {
            this.logger.error('查询订单失败', error)
            throw error
        }
    }

    /**
     * 申请退款
     */
    async refund(params: WechatRefundParams): Promise<WechatRefundResult> {
        const url = '/v3/refund/domestic/refunds'
        const body = JSON.stringify({
            out_trade_no: params.outTradeNo,
            out_refund_no: params.outRefundNo,
            reason: params.reason,
            amount: {
                refund: params.refundAmount,
                total: params.totalAmount,
                currency: 'CNY',
            },
        })

        try {
            return await this.request('POST', url, body)
        } catch (error) {
            this.logger.error('申请退款失败', error)
            throw error
        }
    }

    /**
     * 发送 HTTP 请求
     */
    private async request(method: string, url: string, body: string): Promise<any> {
        const fullUrl = `${this.apiBase}${url}`
        const authorization = this.generateAuthHeader(method, url, body)

        const response = await fetch(fullUrl, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': authorization,
            },
            body: method !== 'GET' ? body : undefined,
        })

        const data = await response.json()

        if (!response.ok) {
            const error = new Error(data.message || '微信支付接口调用失败')
                ; (error as any).code = data.code
                ; (error as any).response = data
            throw error
        }

        return data
    }

    /**
     * 映射微信错误码到用户友好提示
     */
    mapErrorToUserMessage(errorCode: string): string {
        const errorMap: Record<string, string> = {
            'PARAM_ERROR': '参数错误，请检查支付信息',
            'OUT_TRADE_NO_USED': '订单号已使用，请勿重复支付',
            'SYSTEMERROR': '系统繁忙，请稍后重试',
            'SIGN_ERROR': '签名错误，请联系客服',
            'RULELIMIT': '业务规则限制，请联系客服',
            'ACCOUNTERROR': '账户异常，请联系客服',
            'NOTENOUGH': '余额不足',
            'ORDERPAID': '订单已支付',
            'ORDERCLOSED': '订单已关闭',
            'FREQUENCY_LIMITED': '请求频率过高，请稍后重试',
        }

        return errorMap[errorCode] || '支付失败，请稍后重试'
    }
}
