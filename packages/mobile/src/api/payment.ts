import request from './request'

// 支付渠道
export type PaymentChannel = 'wechat' | 'alipay'

// 客户端类型
export type ClientType = 'h5' | 'pc' | 'app'

// 支付状态
export type PaymentStatus = 'pending' | 'paid' | 'closed' | 'refunded'

// 创建支付请求参数
export interface CreatePaymentParams {
    orderId: number
    channel: PaymentChannel
    clientType: ClientType
}

// 创建支付响应
export interface CreatePaymentResponse {
    paymentId: number
    paymentNo: string
    channel: PaymentChannel
    amount: number
    expireTime: string
    wechatParams?: {
        prepayId?: string
        codeUrl?: string
        h5Url?: string
    }
    alipayParams?: {
        formHtml?: string
        payUrl?: string
    }
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

// 查询支付结果响应
export interface QueryPaymentResponse {
    paymentId: number
    status: PaymentStatus
    channelStatus: string
    synced: boolean
}

/**
 * 创建支付订单
 */
export function createPayment(params: CreatePaymentParams) {
    return request.post<CreatePaymentResponse>('/payments/create', params)
}

/**
 * 获取支付状态
 */
export function getPaymentStatus(paymentId: number) {
    return request.get<PaymentStatusResponse>(`/payments/${paymentId}/status`)
}

/**
 * 主动查询支付结果
 */
export function queryPayment(paymentId: number) {
    return request.post<QueryPaymentResponse>(`/payments/${paymentId}/query`)
}

/**
 * 获取支付详情
 */
export function getPaymentDetail(paymentId: number) {
    return request.get(`/payments/${paymentId}`)
}
