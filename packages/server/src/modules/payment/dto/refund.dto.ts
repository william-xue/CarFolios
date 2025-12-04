import { IsInt, IsOptional, IsString, Min } from 'class-validator'

// 退款请求 DTO
export class RefundDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    amount?: number          // 退款金额(分)，不传则全额退款

    @IsOptional()
    @IsString()
    reason?: string          // 退款原因
}

// 退款状态枚举
export enum RefundStatus {
    PENDING = 'pending',     // 退款中
    SUCCESS = 'success',     // 退款成功
    FAILED = 'failed',       // 退款失败
}

// 退款响应
export interface RefundResponse {
    refundId: string         // 退款单号
    status: RefundStatus
    amount: number           // 退款金额(分)
}
