<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyBuyOrders, payOrder, cancelOrder } from '@/api/order'
import { showToast, showConfirmDialog } from 'vant'
import type { OrderItem, OrderStatus } from '@/types'

const router = useRouter()
const orders = ref<OrderItem[]>([])
const loading = ref(true)

const statusMap: Record<OrderStatus, { text: string; type: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
  pending: { text: '待支付', type: 'warning' },
  paid: { text: '已支付', type: 'primary' },
  closed: { text: '已完成', type: 'success' },
  cancelled: { text: '已取消', type: 'default' },
  refunded: { text: '已退款', type: 'danger' },
}

onMounted(async () => {
  await loadOrders()
})

async function loadOrders() {
  loading.value = true
  try {
    const res = await getMyBuyOrders({ page: 1, pageSize: 50 })
    orders.value = res.list
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function goToDetail(carId: number) {
  router.push(`/car/${carId}`)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('zh-CN')
}

async function handlePay(order: OrderItem) {
  try {
    await showConfirmDialog({
      title: '确认支付',
      message: `确认支付定金 ¥${order.depositAmount.toLocaleString()} 吗？`,
    })
    await payOrder(order.id)
    showToast('支付成功')
    await loadOrders()
  } catch (e: any) {
    if (e !== 'cancel') {
      showToast(e.message || '支付失败')
    }
  }
}

async function handleCancel(order: OrderItem) {
  try {
    await showConfirmDialog({
      title: '取消订单',
      message: '确认取消该订单吗？',
    })
    await cancelOrder(order.id)
    showToast('订单已取消')
    await loadOrders()
  } catch (e: any) {
    if (e !== 'cancel') {
      showToast(e.message || '取消失败')
    }
  }
}
</script>

<template>
  <div class="my-orders-page">
    <van-nav-bar title="我的订单" left-arrow @click-left="goBack" />

    <div v-if="loading" class="loading">
      <van-loading />
    </div>

    <div v-else-if="orders.length === 0" class="empty">
      <van-empty description="暂无订单" />
    </div>

    <div v-else class="order-list">
      <div
        v-for="order in orders"
        :key="order.id"
        class="order-card"
      >
        <div class="order-header">
          <span class="order-no">{{ order.orderNo }}</span>
          <van-tag :type="statusMap[order.status].type">
            {{ statusMap[order.status].text }}
          </van-tag>
        </div>
        <div class="order-content" @click="goToDetail(order.carId)">
          <van-image :src="order.carImage" fit="cover" class="car-image" />
          <div class="order-info">
            <div class="car-title ellipsis-2">{{ order.carTitle }}</div>
            <div class="order-price">
              <span>车辆价格：</span>
              <span class="price">{{ order.carPrice }}万</span>
            </div>
            <div class="order-deposit">
              <span>已付定金：</span>
              <span class="deposit">¥{{ order.depositAmount.toLocaleString() }}</span>
            </div>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-time">{{ formatDate(order.createdAt) }}</span>
          <div class="order-actions">
            <van-button v-if="order.status === 'pending'" size="small" @click="handleCancel(order)">
              取消订单
            </van-button>
            <van-button v-if="order.status === 'pending'" type="primary" size="small" @click="handlePay(order)">
              去支付
            </van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.my-orders-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.order-list {
  padding: 12px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f5f5f5;
}

.order-no {
  font-size: 12px;
  color: #999;
}

.order-content {
  display: flex;
  gap: 12px;
  padding: 12px;
}

.car-image {
  width: 100px;
  height: 75px;
  border-radius: 4px;
  flex-shrink: 0;
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.car-title {
  font-size: 14px;
  line-height: 1.4;
}

.order-price,
.order-deposit {
  font-size: 12px;
  color: #666;
}

.price {
  color: #ff4d4f;
  font-weight: 500;
}

.deposit {
  color: #1989fa;
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-top: 1px solid #f5f5f5;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-actions {
  display: flex;
  gap: 8px;
}
</style>
