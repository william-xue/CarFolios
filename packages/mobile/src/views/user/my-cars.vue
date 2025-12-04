<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyCars, toggleCarStatus, deleteCar } from '@/api/car'
import { showToast, showConfirmDialog } from 'vant'
import type { CarListItem, CarStatus } from '@/types'

const router = useRouter()
const cars = ref<CarListItem[]>([])
const loading = ref(true)

const statusMap: Record<CarStatus, { text: string; type: 'primary' | 'success' | 'warning' | 'danger' | 'default' }> = {
  draft: { text: '草稿', type: 'default' },
  pending: { text: '待审核', type: 'warning' },
  approved: { text: '已通过', type: 'primary' },
  on: { text: '已上架', type: 'success' },
  off: { text: '已下架', type: 'default' },
  sold: { text: '已售出', type: 'danger' },
  rejected: { text: '已拒绝', type: 'danger' },
}

onMounted(async () => {
  await loadCars()
})

async function loadCars() {
  loading.value = true
  try {
    const res = await getMyCars({ page: 1, pageSize: 50 })
    cars.value = res.list
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}

function goToDetail(id: number) {
  router.push(`/car/${id}`)
}

function goToPublish() {
  router.push('/publish')
}

async function handleToggle(car: CarListItem, status: 'on' | 'off') {
  try {
    await toggleCarStatus(car.id, status)
    showToast(status === 'on' ? '上架成功' : '下架成功')
    await loadCars()
  } catch (e: any) {
    showToast(e.message || '操作失败')
  }
}

async function handleDelete(car: CarListItem) {
  try {
    await showConfirmDialog({
      title: '删除车源',
      message: '确认删除该车源吗？删除后无法恢复。',
    })
    await deleteCar(car.id)
    showToast('删除成功')
    await loadCars()
  } catch (e: any) {
    if (e !== 'cancel') {
      showToast(e.message || '删除失败')
    }
  }
}

function getCarStatus(car: any): CarStatus {
  return car.status || 'on'
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
      >
        <div class="car-content" @click="goToDetail(car.id)">
          <van-image :src="car.coverImage" fit="cover" class="car-image" />
          <div class="car-info">
            <div class="car-title ellipsis-2">{{ car.title }}</div>
            <div class="car-meta">
              <span>{{ car.firstRegDate }}</span>
              <span>{{ car.mileage }}万公里</span>
            </div>
            <div class="car-bottom">
              <span class="car-price">{{ car.price }}<small>万</small></span>
              <van-tag :type="statusMap[getCarStatus(car)]?.type || 'default'">
                {{ statusMap[getCarStatus(car)]?.text || '未知' }}
              </van-tag>
            </div>
          </div>
        </div>
        <div class="car-actions">
          <van-button
            v-if="getCarStatus(car) === 'on'"
            size="small"
            @click="handleToggle(car, 'off')"
          >
            下架
          </van-button>
          <van-button
            v-if="getCarStatus(car) === 'off' || getCarStatus(car) === 'approved'"
            size="small"
            type="primary"
            @click="handleToggle(car, 'on')"
          >
            上架
          </van-button>
          <van-button
            v-if="getCarStatus(car) !== 'sold'"
            size="small"
            type="danger"
            plain
            @click="handleDelete(car)"
          >
            删除
          </van-button>
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
  background: #fff;
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.car-content {
  display: flex;
  gap: 12px;
  padding: 12px;
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

.car-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 8px 12px;
  border-top: 1px solid #f5f5f5;
}

.fab-btn {
  position: fixed;
  bottom: 80px;
  right: 16px;
}
</style>
