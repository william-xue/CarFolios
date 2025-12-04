<template>
  <div class="payment-page">
    <!-- 顶部导航 -->
    <van-nav-bar title="确认支付" left-arrow @click-left="router.back()" />

    <!-- 订单信息 -->
    <div class="order-info" v-if="order">
      <div class="car-info">
        <img :src="order.carImage" class="car-image" />
        <div class="car-detail">
          <div class="car-title">{{ order.carTitle }}</div>
          <div class="car-price">¥{{ order.carPrice }}万</div>
        </div>
      </div>
      <div class="amount-row">
        <span>订金金额</span>
        <span class="amount">¥{{ order.depositAmount }}</span>
      </div>
    </div>

    <!-- 支付方式选择 -->
    <div class="payment-methods">
      <div class="section-title">选择支付方式</div>
      <van-radio-group v-model="selectedChannel">
        <van-cell-group inset>
          <van-cell clickable @click="selectedChannel = 'wechat'">
            <template #title>
              <div class="method-item">
                <van-icon name="wechat-pay" color="#07C160" size="24" />
                <span>微信支付</span>
              </div>
            </template>
            <template #right-icon>
              <van-radio name="wechat" />
            </template>
          </van-cell>
          <van-cell clickable @click="selectedChannel = 'alipay'">
            <template #title>
              <div class="method-item">
                <van-icon name="alipay" color="#1677FF" size="24" />
                <span>支付宝</span>
              </div>
            </template>
            <template #right-icon>
              <van-radio name="alipay" />
            </template>
          </van-cell>
        </van-cell-group>
      </van-radio-group>
    </div>

    <!-- 底部支付按钮 -->
    <div class="bottom-bar">
      <div class="total">
        <span>应付金额：</span>
        <span class="price">¥{{ order?.depositAmount || 0 }}</span>
      </div>
      <van-button type="primary" :loading="loading" @click="handlePay">
        立即支付
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { getOrderDetail } from '@/api/order'
import { createPayment, getPaymentStatus, type PaymentChannel } from '@/api/payment'
import type { OrderItem } from '@/types'

const route = useRoute()
const router = useRouter()

const orderId = Number(route.params.orderId)
const order = ref<OrderItem | null>(null)
const selectedChannel = ref<PaymentChannel>('wechat')
const loading = ref(false)
const paymentId = ref<number | null>(null)
let pollTimer: number | null = null

// 获取订单详情
const fetchOrder = async () => {
  try {
    order.value = await getOrderDetail(orderId)
  } catch (error) {
    showToast('获取订单信息失败')
  }
}

// 发起支付
const handlePay = async () => {
  if (!order.value) return

  loading.value = true
  try {
    const res = await createPayment({
      orderId: order.value.id,
      channel: selectedChannel.value,
      clientType: 'h5',
    })

    paymentId.value = res.paymentId

    // 根据支付渠道处理
    if (selectedChannel.value === 'wechat' && res.wechatParams?.h5Url) {
      // 微信 H5 支付：跳转到微信支付页面
      window.location.href = res.wechatParams.h5Url
    } else if (selectedChannel.value === 'alipay' && res.alipayParams?.formHtml) {
      // 支付宝：提交表单
      const div = document.createElement('div')
      div.innerHTML = res.alipayParams.formHtml
      document.body.appendChild(div)
      const form = div.querySelector('form')
      if (form) form.submit()
    } else {
      // 开始轮询支付状态
      startPolling()
      showToast('请在弹出的页面完成支付')
    }
  } catch (error: any) {
    showToast(error.message || '创建支付订单失败')
  } finally {
    loading.value = false
  }
}

// 轮询支付状态
const startPolling = () => {
  if (pollTimer) clearInterval(pollTimer)

  pollTimer = window.setInterval(async () => {
    if (!paymentId.value) return

    try {
      const res = await getPaymentStatus(paymentId.value)
      if (res.status === 'paid') {
        stopPolling()
        router.replace({
          name: 'PaymentResult',
          params: { paymentId: String(paymentId.value) },
          query: { status: 'success' },
        })
      } else if (res.status === 'closed') {
        stopPolling()
        showToast('支付已关闭')
      }
    } catch (error) {
      console.error('查询支付状态失败', error)
    }
  }, 2000)
}

const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

onMounted(() => {
  fetchOrder()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.payment-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 80px;
}

.order-info {
  background: #fff;
  margin: 12px;
  border-radius: 8px;
  padding: 16px;
}

.car-info {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}

.car-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.car-detail {
  flex: 1;
}

.car-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.car-price {
  font-size: 16px;
  color: #ff6b00;
  font-weight: bold;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  padding-top: 12px;
  font-size: 14px;
}

.amount {
  color: #ff6b00;
  font-weight: bold;
}

.payment-methods {
  margin: 12px;
}

.section-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  padding-left: 4px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

.total {
  font-size: 14px;
}

.total .price {
  font-size: 20px;
  color: #ff6b00;
  font-weight: bold;
}

.bottom-bar .van-button {
  width: 120px;
}
</style>
