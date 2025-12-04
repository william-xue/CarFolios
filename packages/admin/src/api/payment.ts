import request from './request'

// 支付渠道
export type PaymentChannel = 'wechat' | 'alipay'

// 支付状态
export type PaymentStatus = 'pending' | 'paid' | 'closed' | 'refunded'

// 支付订单
export interface PaymentItem {
    id: number
    paymentNo: string
    orderId: number
    userId: number
    channel: PaymentChannel
    clientType: string
    amount: number
    status: PaymentStatus
    channelTradeNo?: string
    clientIp?: string
    expireTime: string
    paidAt?: string
    closedAt?: string
    refundedAt?: string
    refundAmount?: number
    refundReason?: string
    createdAt: string
    updatedAt: string
    order?: {
        orderNo: string
        carTitle: string
    }
    user?: {
        id: number
        nickname: string
        mobile: string
    }
}

// 支付日志
export interface PaymentLog {
    id: number
    paymentId: number
    action: string
    status: string
    newStatus?: string
    requestData?: string
    responseData?: string
    errorMessage?: string
    operatorId?: number
    clientIp?: string
    createdAt: string
}

// 查询参数
export interface PaymentQueryParams {
    page?: number
    pageSize?: number
    status?: PaymentStatus
    channel?: PaymentChannel
    paymentNo?: string
    orderNo?: string
    startDate?: string
    endDate?: string
}

// 分页结果
export interface PaymentListResult {
    list: PaymentItem[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}

// 退款参数
export interface RefundParams {
    amount?: number
    reason?: string
}

// 支付统计
export interface PaymentStats {
    today: { amount: number; count: number }
    week: { amount: number; count: number }
    month: { amount: number; count: number }
    byChannel: {
        wechat: { amount: number; count: number }
        alipay: { amount: number; count: number }
    }
    total: { amount: number; count: number }
}

/**
 * 获取支付订单列表
 */
export function getPaymentList(params: PaymentQueryParams) {
    return request.get<PaymentListResult>('/payments', { params })
}

/**
 * 获取支付订单详情
 */
export function getPaymentDetail(id: number) {
    return request.get<PaymentItem & { logs: PaymentLog[] }>(`/payments/${id}`)
}

/**
 * 发起退款
 */
export function refundPayment(id: number, params: RefundParams) {
    return request.post(`/payments/${id}/refund`, params)
}

/**
 * 获取支付统计
 */
export function getPaymentStats() {
    return request.get<PaymentStats>('/stats/payment')
}
