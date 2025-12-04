import request from './request'
import type { OrderItem, PageResult } from '@/types'

export interface OrderListParams {
    page?: number
    pageSize?: number
    status?: string
}

// 创建订单
export function createOrder(carId: number, depositAmount: number): Promise<OrderItem> {
    return request.post('/orders', { carId, depositAmount })
}

// 获取我的购买订单
export function getMyBuyOrders(params: OrderListParams): Promise<PageResult<OrderItem>> {
    return request.get('/orders/my/buy', { params })
}

// 获取我的出售订单
export function getMySellOrders(params: OrderListParams): Promise<PageResult<OrderItem>> {
    return request.get('/orders/my/sell', { params })
}

// 获取订单详情
export function getOrderDetail(id: number): Promise<OrderItem> {
    return request.get(`/orders/${id}`)
}

// 支付订单
export function payOrder(id: number) {
    return request.patch(`/orders/${id}/pay`)
}

// 取消订单
export function cancelOrder(id: number) {
    return request.patch(`/orders/${id}/cancel`)
}
