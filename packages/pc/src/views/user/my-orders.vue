<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Order } from '@/types'
import { formatOrderStatus, formatDate } from '@/utils'
import { useLocale } from '@/composables/useLocale'

const { t, formatPrice } = useLocale()
const router = useRouter()
const orderStore = useOrderStore()

const page = ref(1)
const pageSize = 10
const hasMore = ref(true)
const statusFilter = ref('')

// 状态筛选选项
const statusOptions = computed(() => [
    { label: t('common.all'), value: '' },
    { label: t('order.status.pending'), value: 'pending' },
    { label: t('order.status.paid'), value: 'paid' },
    { label: t('order.status.completed'), value: 'completed' },
    { label: t('order.status.cancelled'), value: 'cancelled' },
])

// 加载订单列表
async function loadOrders(reset = false) {
    if (reset) {
        page.value = 1
        hasMore.value = true
    }

    const res = await orderStore.fetchOrders({
        page: page.value,
        pageSize,
        status: statusFilter.value || undefined,
    })
    hasMore.value = res.list.length === pageSize && orderStore.orders.length < res.total
}

// 加载更多
function loadMore() {
    if (!hasMore.value || orderStore.loading) return
    page.value++
    loadOrders()
}

// 筛选状态变化
function handleStatusChange() {
    loadOrders(true)
}

// 支付订单
async function handlePay(order: Order) {
    try {
        const { value: paymentMethod } = await ElMessageBox.prompt(t('order.pay'), t('order.pay'), {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            inputPattern: /^(alipay|wechat)$/,
            inputErrorMessage: 'alipay / wechat',
            inputPlaceholder: 'alipay / wechat',
        })

        const payUrl = await orderStore.payOrder(order.id, paymentMethod as 'alipay' | 'wechat')
        // 跳转到支付页面
        window.open(payUrl, '_blank')
        ElMessage.info(t('message.operationSuccess'))
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || t('message.operationFailed'))
        }
    }
}

// 取消订单
async function handleCancel(order: Order) {
    try {
        await ElMessageBox.confirm(t('order.cancel'), t('order.cancel'), {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
        })

        await orderStore.cancelOrder(order.id)
        ElMessage.success(t('message.operationSuccess'))
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || t('message.operationFailed'))
        }
    }
}

// 查看车辆详情
function viewCar(carId: number) {
    router.push(`/car/${carId}`)
}

// 获取状态标签类型
function getStatusType(status: string): 'success' | 'info' | 'warning' | 'danger' {
    const typeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
        pending: 'warning',
        paid: 'success',
        completed: 'success',
        cancelled: 'info',
        refunded: 'danger',
    }
    return typeMap[status] || 'info'
}

onMounted(() => {
    loadOrders(true)
})
</script>

<template>
    <div class="my-orders-page">
        <div class="page-container">
            <div class="page-header">
                <h1 class="page-title">{{ t('nav.myOrders') }}</h1>
                <el-radio-group v-model="statusFilter" @change="handleStatusChange">
                    <el-radio-button
                        v-for="opt in statusOptions"
                        :key="opt.value"
                        :value="opt.value"
                    >
                        {{ opt.label }}
                    </el-radio-button>
                </el-radio-group>
            </div>

            <div v-loading="orderStore.loading" class="order-list">
                <el-empty v-if="orderStore.orders.length === 0 && !orderStore.loading" :description="t('order.noOrder')" />

                <div v-for="order in orderStore.orders" :key="order.id" class="order-item card">
                    <div class="order-header">
                        <span class="order-no">{{ t('order.no') }}：{{ order.orderNo }}</span>
                        <el-tag :type="getStatusType(order.status)" size="small">
                            {{ formatOrderStatus(order.status) }}
                        </el-tag>
                    </div>

                    <div class="order-content" @click="viewCar(order.carId)">
                        <div class="car-image-wrapper">
                            <el-image :src="order.car?.coverImage" fit="cover" class="car-image">
                                <template #error>
                                    <div class="image-placeholder">
                                        <el-icon><Picture /></el-icon>
                                    </div>
                                </template>
                            </el-image>
                        </div>
                        <div class="car-info">
                            <h3 class="car-title">{{ order.car?.title || '车辆信息' }}</h3>
                            <div class="car-meta">
                                <span v-if="order.car?.firstRegDate">{{ order.car.firstRegDate }}</span>
                                <span v-if="order.car?.mileage">{{ order.car.mileage }}万公里</span>
                            </div>
                        </div>
                        <div class="order-price">
                            <span class="price-label">{{ t('order.amount') }}</span>
                            <span class="price-value">{{ formatPrice(order.amount) }}</span>
                        </div>
                    </div>

                    <div class="order-footer">
                        <span class="order-time">{{ formatDate(order.createdAt, 'datetime') }}</span>
                        <div class="order-actions">
                            <el-button
                                v-if="order.status === 'pending'"
                                type="primary"
                                size="small"
                                @click="handlePay(order)"
                            >
                                {{ t('order.pay') }}
                            </el-button>
                            <el-button
                                v-if="order.status === 'pending'"
                                size="small"
                                @click="handleCancel(order)"
                            >
                                {{ t('order.cancel') }}
                            </el-button>
                            <el-button size="small" @click="viewCar(order.carId)">{{ t('common.view') }}</el-button>
                        </div>
                    </div>
                </div>

                <!-- 加载更多 -->
                <div v-if="hasMore && orderStore.orders.length > 0" class="load-more">
                    <el-button :loading="orderStore.loading" @click="loadMore">{{ t('common.more') }}</el-button>
                </div>
                <div v-else-if="orderStore.orders.length > 0" class="no-more">{{ t('common.noData') }}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.my-orders-page {
    background: $bg-color-page;
    min-height: calc(100vh - $header-height - 100px);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
}

.order-list {
    min-height: 200px;
}

.order-item {
    padding: 16px;
    margin-bottom: 16px;
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-color-lighter;
    margin-bottom: 12px;
}

.order-no {
    font-size: 14px;
    color: $text-secondary;
}

.order-content {
    display: flex;
    gap: 16px;
    cursor: pointer;

    &:hover .car-title {
        color: $primary-color;
    }
}

.car-image-wrapper {
    flex-shrink: 0;
    width: 120px;
    height: 90px;
    border-radius: $border-radius-sm;
    overflow: hidden;
}

.car-image {
    width: 100%;
    height: 100%;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-color;
    color: $text-placeholder;
    font-size: 24px;
}

.car-info {
    flex: 1;
}

.car-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
    transition: color 0.2s;
}

.car-meta {
    display: flex;
    gap: 12px;
    font-size: 14px;
    color: $text-secondary;
}

.order-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
}

.price-label {
    font-size: 12px;
    color: $text-secondary;
    margin-bottom: 4px;
}

.price-value {
    font-size: 20px;
    font-weight: 600;
    color: $price-color;
}

.order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid $border-color-lighter;
}

.order-time {
    font-size: 12px;
    color: $text-placeholder;
}

.order-actions {
    display: flex;
    gap: 8px;
}

.load-more {
    text-align: center;
    padding: 24px 0;
}

.no-more {
    text-align: center;
    padding: 24px 0;
    color: $text-placeholder;
    font-size: 14px;
}
</style>
