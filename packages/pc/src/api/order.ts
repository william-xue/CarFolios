import type { Order, PageParams, PageResult } from '@/types'
import { get, patch, post } from './request'

// 获取我的购买订单列表
export function getMyOrders(params: PageParams & { status?: string }): Promise<PageResult<Order>> {
    return get('/orders/my/buy', { params })
}

// 获取我的出售订单列表
export function getMySellOrders(params: PageParams & { status?: string }): Promise<PageResult<Order>> {
    return get('/orders/my/sell', { params })
}

// 获取订单详情
export function getOrderDetail(id: number): Promise<Order> {
    return get(`/orders/${id}`)
}

// 创建订单（预约看车）
export function createOrder(carId: number): Promise<Order> {
    return post('/orders', { carId })
}

// 支付订单
export function payOrder(id: number, paymentMethod: 'alipay' | 'wechat'): Promise<{ payUrl: string }> {
    return post(`/orders/${id}/pay`, { paymentMethod })
}

// 取消订单
export function cancelOrder(id: number): Promise<void> {
    return patch(`/orders/${id}/cancel`)
}

// 确认收货/完成订单
export function completeOrder(id: number): Promise<void> {
    return patch(`/orders/${id}/complete`)
}
