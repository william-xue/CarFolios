import { get, post } from './request'
import type { Order, PaginatedResponse } from '../types'

// 获取我的订单
export function getMyOrders(params: { page?: number; pageSize?: number; status?: string }) {
    return get<PaginatedResponse<Order>>('/orders/my', params)
}

// 获取订单详情
export function getOrderDetail(id: number) {
    return get<Order>(`/orders/${id}`)
}

// 创建订单
export function createOrder(carId: number) {
    return post<Order>('/orders', { carId })
}

// 取消订单
export function cancelOrder(id: number) {
    return post<{ success: boolean }>(`/orders/${id}/cancel`)
}
