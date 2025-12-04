<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'

const router = useRouter()
const carStore = useCarStore()

const keyword = ref('')
const page = ref(1)
const pageSize = 10
const finished = ref(false)
const searched = ref(false)

async function onSearch() {
  if (!keyword.value.trim()) return
  searched.value = true
  page.value = 1
  finished.value = false
  carStore.cars = []
  await loadData()
}

async function loadData() {
  const res = await carStore.fetchCars({ page: page.value, pageSize, keyword: keyword.value })
  if (res.list.length < pageSize) {
    finished.value = true
  }
}

async function onLoad() {
  if (!searched.value) {
    finished.value = true
    return
  }
  page.value++
  await loadData()
}

function goToDetail(id: number) {
  router.push(`/car/${id}`)
}

function goBack() {
  router.back()
}

function formatGearbox(type?: string) {
  const map: Record<string, string> = { MT: '手动', AT: '自动', DCT: '双离合', CVT: 'CVT' }
  return map[type || ''] || type || '-'
}
</script>

<template>
  <div class="search-page">
    <van-nav-bar title="搜索" left-arrow @click-left="goBack" />
    
    <van-search
      v-model="keyword"
      placeholder="搜索车型、品牌"
      show-action
      autofocus
      @search="onSearch"
    >
      <template #action>
        <div @click="onSearch">搜索</div>
      </template>
    </van-search>

    <div class="search-result">
      <van-list
        v-model:loading="carStore.loading"
        :finished="finished"
        :finished-text="searched ? '没有更多了' : ''"
        @load="onLoad"
      >
        <div v-if="!searched && !carStore.cars.length" class="search-tip">
          输入关键词搜索车辆
        </div>
        <div v-else-if="searched && !carStore.cars.length && !carStore.loading" class="search-empty">
          <van-empty description="未找到相关车辆" />
        </div>
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
    </div>
  </div>
</template>

<style scoped>
.search-page {
  min-height: 100vh;
  background: #f7f8fa;
}

.search-result {
  padding: 12px;
}

.search-tip {
  text-align: center;
  color: #999;
  padding: 40px 0;
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
