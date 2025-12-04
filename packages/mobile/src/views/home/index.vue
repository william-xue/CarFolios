<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'

const router = useRouter()
const carStore = useCarStore()

const keyword = ref('')
const page = ref(1)
const pageSize = 10
const finished = ref(false)
const refreshing = ref(false)

onMounted(() => {
  loadData()
  carStore.fetchBrands()
})

async function loadData() {
  const res = await carStore.fetchCars({ page: page.value, pageSize, keyword: keyword.value })
  if (res.list.length < pageSize) {
    finished.value = true
  }
}

async function onRefresh() {
  page.value = 1
  finished.value = false
  await loadData()
  refreshing.value = false
}

async function onLoad() {
  page.value++
  await loadData()
}

function goToSearch() {
  router.push('/search')
}

function goToDetail(id: number) {
  router.push(`/car/${id}`)
}

function formatGearbox(type: string) {
  const map: Record<string, string> = { MT: '手动', AT: '自动', DCT: '双离合', CVT: 'CVT' }
  return map[type] || type
}
</script>

<template>
  <div class="home-page">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <van-search
        v-model="keyword"
        placeholder="搜索车型、品牌"
        shape="round"
        readonly
        @click="goToSearch"
      />
    </div>

    <!-- 品牌快捷入口 -->
    <div class="brand-section">
      <div class="brand-list">
        <div
          v-for="brand in carStore.brands.slice(0, 8)"
          :key="brand.id"
          class="brand-item"
        >
          <img v-if="brand.logo" :src="brand.logo" :alt="brand.name" class="brand-logo" />
          <div v-else class="brand-placeholder">{{ brand.name[0] }}</div>
          <span class="brand-name">{{ brand.name }}</span>
        </div>
      </div>
    </div>

    <!-- 车源列表 -->
    <div class="car-list-section">
      <div class="section-title">精选好车</div>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model:loading="carStore.loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <div
            v-for="car in carStore.cars"
            :key="car.id"
            class="car-card"
            @click="goToDetail(car.id)"
          >
            <van-image :src="car.coverImage" fit="cover" class="car-image" />
            <div class="car-info">
              <div class="car-title ellipsis-2">{{ car.title }}</div>
              <div class="car-tags">
                <van-tag plain type="primary">{{ car.firstRegDate }}</van-tag>
                <van-tag plain>{{ car.mileage }}万公里</van-tag>
                <van-tag plain>{{ formatGearbox(car.gearbox) }}</van-tag>
              </div>
              <div class="car-bottom">
                <span class="car-price">{{ car.price }}<small>万</small></span>
                <span class="car-city">{{ car.cityName }}</span>
              </div>
            </div>
          </div>
        </van-list>
      </van-pull-refresh>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

.search-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
}

.brand-section {
  background: #fff;
  padding: 12px;
  margin-bottom: 12px;
}

.brand-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.brand-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.brand-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.brand-placeholder {
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
}

.brand-name {
  font-size: 12px;
  color: #666;
}

.car-list-section {
  background: #fff;
  padding: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
}

.car-card {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f5f5f5;
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
  overflow: hidden;
}

.car-title {
  font-size: 14px;
  line-height: 1.4;
  color: #333;
}

.car-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.car-bottom {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.car-price {
  color: #ff4d4f;
  font-size: 18px;
  font-weight: 600;
}

.car-price small {
  font-size: 12px;
  font-weight: normal;
}

.car-city {
  font-size: 12px;
  color: #999;
}
</style>
