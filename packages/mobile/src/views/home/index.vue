<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import LocationFilter from '@/components/LocationFilter.vue'

const router = useRouter()
const carStore = useCarStore()

const keyword = ref('')
const page = ref(1)
const pageSize = 10
const finished = ref(false)
const refreshing = ref(false)

// 位置筛选
const showLocationFilter = ref(false)
const selectedProvinceId = ref<number | undefined>()
const selectedCityId = ref<number | undefined>()
const selectedProvinceName = ref<string | undefined>()
const selectedCityName = ref<string | undefined>()

// 当前位置显示文本
const locationText = computed(() => {
  if (selectedCityName.value) return selectedCityName.value
  if (selectedProvinceName.value) return selectedProvinceName.value
  return '全国'
})

onMounted(() => {
  loadData()
  carStore.fetchBrands()
})

async function loadData() {
  const res = await carStore.fetchCars({ 
    page: page.value, 
    pageSize, 
    keyword: keyword.value,
    provinceId: selectedProvinceId.value,
    cityId: selectedCityId.value
  })
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

// 位置筛选确认
function handleLocationConfirm(data: { 
  provinceId?: number
  provinceName?: string
  cityId?: number
  cityName?: string 
}) {
  selectedProvinceId.value = data.provinceId
  selectedProvinceName.value = data.provinceName
  selectedCityId.value = data.cityId
  selectedCityName.value = data.cityName
  
  // 重新加载数据
  page.value = 1
  finished.value = false
  carStore.cars = []
  loadData()
}

// 打开位置筛选
function openLocationFilter() {
  showLocationFilter.value = true
}
</script>

<template>
  <div class="home-page">
    <!-- 顶部栏：位置 + 搜索 -->
    <div class="top-bar">
      <div class="location-entry" @click="openLocationFilter">
        <van-icon name="location-o" />
        <span class="location-text">{{ locationText }}</span>
        <van-icon name="arrow-down" size="12" />
      </div>
      <div class="search-bar">
        <van-search
          v-model="keyword"
          placeholder="搜索车型、品牌"
          shape="round"
          readonly
          @click="goToSearch"
        />
      </div>
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
                <van-tag plain>{{ formatGearbox(car.gearbox || '') }}</van-tag>
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
    
    <!-- 位置筛选弹窗 -->
    <LocationFilter
      v-model:visible="showLocationFilter"
      :province-id="selectedProvinceId"
      :city-id="selectedCityId"
      @confirm="handleLocationConfirm"
    />
  </div>
</template>

<style scoped>
.home-page {
  padding-bottom: 60px;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
}

.location-entry {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  color: #333;
  font-size: 14px;
  flex-shrink: 0;
}

.location-text {
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-bar {
  flex: 1;
}

.search-bar :deep(.van-search) {
  padding: 0;
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
