import { Controller, Post, Body, Headers, Req, Res, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
import { PaymentService } from './payment.service'
import { WechatPayService, WechatCallbackData } from './wechat-pay.service'
import { AlipayService } from './alipay.service'

// 微信回调请求体
interface WechatCallbackBody {
    id: string
    create_time: string
    resource_type: string
    event_type: string
    resource: {
        algorithm: string
        ciphertext: string
        associated_data: string
        nonce: string
    }
}

@Controller('payments/callback')
export class PaymentCallbackController {
    private readonly logger = new Logger(PaymentCallbackController.name)

    constructor(
        private readonly paymentService: PaymentService,
        private readonly wechatPayService: WechatPayService,
        private readonly alipayService: AlipayService,
    ) { }

    /**
     * 微信支付回调
     * POST /payments/callback/wechat
     */
    @Post('wechat')
    async wechatCallback(
        @Headers() headers: Record<string, string>,
        @Body() body: WechatCallbackBody,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        this.logger.log('收到微信支付回调')

        try {
            // 1. 验证签名
            const rawBody = JSON.stringify(body)
            if (!this.wechatPayService.verifyCallback(headers, rawBody)) {
                this.logger.warn('微信回调签名验证失败')
                return res.status(401).json({ code: 'FAIL', message: '签名验证失败' })
            }

            // 2. 检查事件类型
            if (body.event_type !== 'TRANSACTION.SUCCESS') {
                this.logger.log(`非支付成功事件: ${body.event_type}`)
                return res.json({ code: 'SUCCESS', message: '处理成功' })
            }

            // 3. 解密回调数据
            const { resource } = body
            const callbackData: WechatCallbackData = this.wechatPayService.decryptCallback(
                resource.ciphertext,
                resource.nonce,
                resource.associated_data,
            )

            this.logger.log(`微信支付成功: ${callbackData.out_trade_no}`)

            // 4. 处理支付成功
            await this.paymentService.handlePaymentSuccess(
                callbackData.out_trade_no,
                callbackData.transaction_id,
                callbackData.amount.total,
            )

            // 5. 返回成功响应
            return res.json({ code: 'SUCCESS', message: '处理成功' })
        } catch (error) {
            this.logger.error('处理微信回调失败', error)
            // 返回失败，微信会重试
            return res.status(500).json({ code: 'FAIL', message: '处理失败' })
        }
    }

    /**
     * 支付宝回调
     * POST /payments/callback/alipay
     */
    @Post('alipay')
    async alipayCallback(
        @Body() body: Record<string, string>,
        @Req() req: Request,
        @Res() res: Response,
    ) {
        this.logger.log('收到支付宝回调')

        try {
            // 1. 验证签名
            if (!this.alipayService.verifyCallback(body)) {
                this.logger.warn('支付宝回调签名验证失败')
                return res.send('fail')
            }

            // 2. 检查交易状态
            const tradeStatus = body.trade_status
            if (tradeStatus !== 'TRADE_SUCCESS' && tradeStatus !== 'TRADE_FINISHED') {
                this.logger.log(`非支付成功状态: ${tradeStatus}`)
                return res.send('success')
            }

            const outTradeNo = body.out_trade_no
            const tradeNo = body.trade_no
            const totalAmount = body.total_amount

            this.logger.log(`支付宝支付成功: ${outTradeNo}`)

            // 3. 处理支付成功
            // 金额转换：元转分
            const amountInCents = Math.round(parseFloat(totalAmount) * 100)
            await this.paymentService.handlePaymentSuccess(outTradeNo, tradeNo, amountInCents)

            // 4. 返回成功响应
            return res.send('success')
        } catch (error) {
            this.logger.error('处理支付宝回调失败', error)
            // 返回失败，支付宝会重试
            return res.send('fail')
        }
    }
}
