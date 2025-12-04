import request from './request'
import type { OrderItem, PageResult } from '@/types'

export interface OrderListParams {
    page?: number
    pageSize?: number
    keyword?: string
    status?: string
}

// 获取订单列表
export function getOrders(params: OrderListParams): Promise<PageResult<OrderItem>> {
    return request.get('/orders', { params })
}

// 获取订单详情
export function getOrderDetail(id: number): Promise<OrderItem> {
    return request.get(`/orders/${id}`)
}

// 完成订单
export function completeOrder(id: number) {
    return request.patch(`/orders/${id}/complete`)
}

// 取消订单
export function cancelOrder(id: number) {
    return request.patch(`/orders/${id}/cancel`)
}

// 退款
export function refundOrder(id: number) {
    return request.patch(`/orders/${id}/refund`)
}
