<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { useUserStore } from '@/stores/user'
import { createOrder } from '@/api/order'
import { showToast, showConfirmDialog, showLoadingToast, closeToast } from 'vant'

const route = useRoute()
const router = useRouter()
const carStore = useCarStore()
const userStore = useUserStore()

const carId = Number(route.params.id)
const showContact = ref(false)
const ordering = ref(false)

onMounted(() => {
  carStore.fetchCarDetail(carId)
})

function formatGearbox(type?: string) {
  const map: Record<string, string> = { MT: '手动', AT: '自动', DCT: '双离合', CVT: 'CVT' }
  return map[type || ''] || type
}

function handleContact() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  showContact.value = true
}

async function handleOrder() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }

  try {
    await showConfirmDialog({
      title: '确认下单',
      message: `确定要支付定金 ¥5,000 预订该车辆吗？`,
    })
    
    ordering.value = true
    showLoadingToast({ message: '创建订单中...', forbidClick: true })
    
    await createOrder(carId, 5000)
    closeToast()
    showToast('下单成功')
    router.push('/my-orders')
  } catch (e: any) {
    closeToast()
    if (e !== 'cancel') {
      showToast(e.message || '下单失败')
    }
  } finally {
    ordering.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="car-detail-page" v-if="carStore.currentCar">
    <!-- 导航栏 -->
    <van-nav-bar title="车辆详情" left-arrow @click-left="goBack" />

    <!-- 图片轮播 -->
    <van-swipe :autoplay="3000" indicator-color="#fff">
      <van-swipe-item v-for="(img, index) in carStore.currentCar.images" :key="index">
        <van-image :src="img" fit="cover" class="car-swipe-image" />
      </van-swipe-item>
    </van-swipe>

    <!-- 基本信息 -->
    <div class="car-info-card">
      <div class="car-title">{{ carStore.currentCar.title }}</div>
      <div class="car-price-row">
        <span class="price">{{ carStore.currentCar.price }}<small>万</small></span>
        <span v-if="carStore.currentCar.originalPrice" class="original-price">
          新车价 {{ carStore.currentCar.originalPrice }}万
        </span>
      </div>
      <div class="car-tags">
        <van-tag type="primary">{{ carStore.currentCar.firstRegDate }}上牌</van-tag>
        <van-tag>{{ carStore.currentCar.mileage }}万公里</van-tag>
        <van-tag>{{ formatGearbox(carStore.currentCar.gearbox) }}</van-tag>
        <van-tag>{{ carStore.currentCar.cityName }}</van-tag>
      </div>
    </div>

    <!-- 车辆亮点 -->
    <div class="section-card">
      <div class="section-title">车辆亮点</div>
      <div class="highlight-text">{{ carStore.currentCar.highlightDesc }}</div>
    </div>

    <!-- 基本参数 -->
    <div class="section-card">
      <div class="section-title">基本参数</div>
      <van-cell-group :border="false">
        <van-cell title="上牌时间" :value="carStore.currentCar.firstRegDate" />
        <van-cell title="表显里程" :value="`${carStore.currentCar.mileage}万公里`" />
        <van-cell title="排放标准" :value="carStore.currentCar.emissionStandard" />
        <van-cell title="变速箱" :value="formatGearbox(carStore.currentCar.gearbox)" />
        <van-cell title="排量" :value="`${carStore.currentCar.displacement}L`" />
        <van-cell title="过户次数" :value="`${carStore.currentCar.transferCount}次`" />
        <van-cell title="车身颜色" :value="carStore.currentCar.color || '-'" />
        <van-cell title="所在地" :value="carStore.currentCar.cityName" />
      </van-cell-group>
    </div>

    <!-- 车辆配置 -->
    <div v-if="carStore.currentCar.configs?.length" class="section-card">
      <div class="section-title">车辆配置</div>
      <div class="config-list">
        <van-tag v-for="config in carStore.currentCar.configs" :key="config" plain>
          {{ config }}
        </van-tag>
      </div>
    </div>

    <!-- 卖家信息 -->
    <div class="section-card seller-card">
      <div class="seller-info">
        <van-image :src="carStore.currentCar.ownerAvatar" round width="48" height="48" />
        <div class="seller-detail">
          <div class="seller-name">{{ carStore.currentCar.ownerName }}</div>
          <div class="seller-type">{{ carStore.currentCar.sourceType === 'platform' ? '平台认证' : '个人卖家' }}</div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar safe-area-bottom">
      <van-button icon="phone-o" @click="handleContact">联系卖家</van-button>
      <van-button type="primary" @click="handleOrder">立即预约</van-button>
    </div>

    <!-- 联系方式弹窗 -->
    <van-action-sheet v-model:show="showContact" title="联系卖家">
      <div class="contact-content">
        <van-cell-group>
          <van-cell title="电话咨询" value="400-888-8888" is-link />
          <van-cell title="在线咨询" value="点击咨询" is-link />
        </van-cell-group>
      </div>
    </van-action-sheet>
  </div>
</template>

<style scoped>
.car-detail-page {
  padding-bottom: 70px;
  background: #f7f8fa;
}

.car-swipe-image {
  width: 100%;
  height: 250px;
}

.car-info-card {
  background: #fff;
  padding: 16px;
  margin-bottom: 12px;
}

.car-title {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 8px;
}

.car-price-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 12px;
}

.price {
  color: #ff4d4f;
  font-size: 28px;
  font-weight: 600;
}

.price small {
  font-size: 14px;
}

.original-price {
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
}

.car-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.section-card {
  background: #fff;
  padding: 16px;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.highlight-text {
  color: #666;
  line-height: 1.6;
}

.config-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.seller-card {
  display: flex;
  align-items: center;
}

.seller-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.seller-name {
  font-size: 16px;
  font-weight: 500;
}

.seller-type {
  font-size: 12px;
  color: #999;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
}

.bottom-bar .van-button {
  flex: 1;
}

.contact-content {
  padding: 16px;
}
</style>
