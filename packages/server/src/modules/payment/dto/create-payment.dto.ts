import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { PaymentChannel, ClientType } from '../constants/payment-channel'

// 创建支付订单 DTO
export class CreatePaymentDto {
    @IsInt()
    @Min(1)
    orderId: number

    @IsEnum(PaymentChannel)
    channel: PaymentChannel

    @IsEnum(ClientType)
    clientType: ClientType

    @IsOptional()
    @IsString()
    clientIp?: string
}

// 创建支付订单响应
export interface CreatePaymentResponse {
    paymentId: number
    paymentNo: string
    channel: PaymentChannel
    amount: number           // 支付金额(分)
    expireTime: string       // 过期时间 ISO 字符串
    // 微信支付参数
    wechatParams?: {
        prepayId?: string      // JSAPI 支付
        codeUrl?: string       // Native 支付二维码
        h5Url?: string         // H5 支付跳转链接
    }
    // 支付宝参数
    alipayParams?: {
        formHtml?: string      // 支付表单 HTML
        payUrl?: string        // 支付跳转 URL
    }
}
