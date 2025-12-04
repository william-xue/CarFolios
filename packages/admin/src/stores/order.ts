import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { OrderItem, OrderFilters, PageParams, OrderStatus } from '@/types'
import { mockGetOrders, mockGetOrderDetail, mockUpdateOrderStatus } from '@/mock'

export const useOrderStore = defineStore('order', () => {
    const orders = ref<OrderItem[]>([])
    const currentOrder = ref<OrderItem | null>(null)
    const total = ref(0)
    const loading = ref(false)

    async function fetchOrders(params: OrderFilters & PageParams) {
        loading.value = true
        try {
            const res = await mockGetOrders(params)
            orders.value = res.list
            total.value = res.total
            return res
        } finally {
            loading.value = false
        }
    }

    async function fetchOrderDetail(id: number) {
        loading.value = true
        try {
            currentOrder.value = await mockGetOrderDetail(id)
            return currentOrder.value
        } finally {
            loading.value = false
        }
    }

    async function updateOrderStatus(id: number, status: OrderStatus, reason?: string) {
        await mockUpdateOrderStatus(id, status, reason)
    }

    return {
        orders,
        currentOrder,
        total,
        loading,
        fetchOrders,
        fetchOrderDetail,
        updateOrderStatus,
    }
})
