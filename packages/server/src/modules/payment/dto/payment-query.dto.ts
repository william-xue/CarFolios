import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { PaymentChannel } from '../constants/payment-channel'
import { PaymentStatus } from '../constants/payment-status'

// 支付订单查询 DTO（管理后台）
export class PaymentQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 10

    @IsOptional()
    @IsEnum(PaymentStatus)
    status?: PaymentStatus

    @IsOptional()
    @IsEnum(PaymentChannel)
    channel?: PaymentChannel

    @IsOptional()
    @IsString()
    paymentNo?: string

    @IsOptional()
    @IsString()
    orderNo?: string

    @IsOptional()
    @IsString()
    startDate?: string       // 开始日期 YYYY-MM-DD

    @IsOptional()
    @IsString()
    endDate?: string         // 结束日期 YYYY-MM-DD
}

// 支付状态响应
export interface PaymentStatusResponse {
    paymentId: number
    paymentNo: string
    status: PaymentStatus
    paidAt?: string
    orderId: number
    orderStatus: string
}

// 主动查询支付结果响应
export interface QueryPaymentResponse {
    paymentId: number
    status: PaymentStatus
    channelStatus: string    // 支付渠道原始状态
    synced: boolean          // 是否有状态更新
}
