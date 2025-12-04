<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyCars } from '@/mock'
import type { CarListItem } from '@/types'

const router = useRouter()
const cars = ref<CarListItem[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    cars.value = await getMyCars()
  } finally {
    loading.value = false
  }
})

function goBack() {
  router.back()
}

function goToDetail(id: number) {
  router.push(`/car/${id}`)
}

function goToPublish() {
  router.push('/publish')
}
</script>

<template>
  <div class="my-cars-page">
    <van-nav-bar title="我的车源" left-arrow @click-left="goBack" />

    <div v-if="loading" class="loading">
      <van-loading />
    </div>

    <div v-else-if="cars.length === 0" class="empty">
      <van-empty description="暂无车源">
        <van-button type="primary" @click="goToPublish">去发布</van-button>
      </van-empty>
    </div>

    <div v-else class="car-list">
      <div
        v-for="car in cars"
        :key="car.id"
        class="car-card"
        @click="goToDetail(car.id)"
      >
        <van-image :src="car.coverImage" fit="cover" class="car-image" />
        <div class="car-info">
          <div class="car-title ellipsis-2">{{ car.title }}</div>
          <div class="car-meta">
            <span>{{ car.firstRegDate }}</span>
            <span>{{ car.mileage }}万公里</span>
          </div>
          <div class="car-bottom">
            <span class="car-price">{{ car.price }}<small>万</small></span>
            <van-tag type="success">已上架</van-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="fab-btn">
      <van-button type="primary" round icon="plus" @click="goToPublish">
        发布车源
      </van-button>
    </div>
  </div>
</template>

<style scoped>
.my-cars-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.car-list {
  padding: 12px;
}

.car-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
}

.car-image {
  width: 120px;
  height: 90px;
  border-radius: 8px;
  flex-shrink: 0;
}

.car-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.car-title {
  font-size: 14px;
  line-height: 1.4;
}

.car-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 8px;
}

.car-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.car-price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: 600;
}

.car-price small {
  font-size: 12px;
}

.fab-btn {
  position: fixed;
  bottom: 80px;
  right: 16px;
}
</style>
