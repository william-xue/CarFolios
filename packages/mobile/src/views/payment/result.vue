<template>
  <div class="result-page">
    <!-- 成功状态 -->
    <div v-if="status === 'success'" class="result-content">
      <van-icon name="checked" color="#07C160" size="64" />
      <div class="result-title">支付成功</div>
      <div class="result-desc">订金已支付，请等待卖家联系</div>
      <div class="result-amount" v-if="payment">
        支付金额：<span>¥{{ (payment.amount / 100).toFixed(2) }}</span>
      </div>
    </div>

    <!-- 失败状态 -->
    <div v-else class="result-content">
      <van-icon name="close" color="#ee0a24" size="64" />
      <div class="result-title">支付失败</div>
      <div class="result-desc">{{ errorMessage || '支付未完成，请重试' }}</div>
    </div>

    <!-- 操作按钮 -->
    <div class="actions">
      <van-button type="primary" block @click="goToOrder">
        查看订单
      </van-button>
      <van-button plain block @click="goHome">
        返回首页
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPaymentDetail } from '@/api/payment'

const route = useRoute()
const router = useRouter()

const paymentId = Number(route.params.paymentId)
const status = ref(route.query.status as string || 'success')
const errorMessage = ref(route.query.error as string || '')
const payment = ref<any>(null)

const fetchPayment = async () => {
  if (!paymentId) return
  try {
    payment.value = await getPaymentDetail(paymentId)
  } catch (error) {
    console.error('获取支付详情失败', error)
  }
}

const goToOrder = () => {
  if (payment.value?.orderId) {
    router.push({ name: 'MyOrders' })
  } else {
    router.push({ name: 'MyOrders' })
  }
}

const goHome = () => {
  router.push({ name: 'Home' })
}

onMounted(() => {
  fetchPayment()
})
</script>

<style scoped>
.result-page {
  min-height: 100vh;
  background: #fff;
  padding: 60px 24px 24px;
}

.result-content {
  text-align: center;
  padding: 40px 0;
}

.result-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-top: 16px;
}

.result-desc {
  font-size: 14px;
  color: #999;
  margin-top: 8px;
}

.result-amount {
  font-size: 14px;
  color: #666;
  margin-top: 24px;
}

.result-amount span {
  font-size: 24px;
  color: #ff6b00;
  font-weight: bold;
}

.actions {
  margin-top: 40px;
}

.actions .van-button {
  margin-bottom: 12px;
}
</style>
