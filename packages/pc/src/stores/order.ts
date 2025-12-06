import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Order, PageParams, PageResult } from '@/types'
import {
    getMyOrders,
    getOrderDetail,
    createOrder as createOrderApi,
    payOrder as payOrderApi,
    cancelOrder as cancelOrderApi,
    completeOrder as completeOrderApi,
} from '@/api/order'

export const useOrderStore = defineStore('order', () => {
    const orders = ref<Order[]>([])
    const currentOrder = ref<Order | null>(null)
    const loading = ref(false)
    const total = ref(0)

    // 获取订单列表
    async function fetchOrders(params: PageParams & { status?: string }): Promise<PageResult<Order>> {
        loading.value = true
        try {
            const res = await getMyOrders(params)
            if (params.page === 1) {
                orders.value = res.list
            } else {
                orders.value = [...orders.value, ...res.list]
            }
            total.value = res.total
            return res
        } finally {
            loading.value = false
        }
    }

    // 获取订单详情
    async function fetchOrderDetail(id: number): Promise<Order> {
        loading.value = true
        try {
            const res = await getOrderDetail(id)
            currentOrder.value = res
            return res
        } finally {
            loading.value = false
        }
    }

    // 创建订单
    async function createOrder(carId: number): Promise<Order> {
        const order = await createOrderApi(carId)
        orders.value.unshift(order)
        return order
    }

    // 支付订单
    async function payOrder(id: number, paymentMethod: 'alipay' | 'wechat'): Promise<string> {
        const res = await payOrderApi(id, paymentMethod)
        return res.payUrl
    }

    // 取消订单
    async function cancelOrder(id: number): Promise<void> {
        await cancelOrderApi(id)
        const order = orders.value.find((o) => o.id === id)
        if (order) {
            order.status = 'cancelled'
        }
    }

    // 完成订单
    async function completeOrder(id: number): Promise<void> {
        await completeOrderApi(id)
        const order = orders.value.find((o) => o.id === id)
        if (order) {
            order.status = 'completed'
        }
    }

    // 清空当前订单
    function clearCurrentOrder() {
        currentOrder.value = null
    }

    return {
        orders,
        currentOrder,
        loading,
        total,
        fetchOrders,
        fetchOrderDetail,
        createOrder,
        payOrder,
        cancelOrder,
        completeOrder,
        clearCurrentOrder,
    }
})
