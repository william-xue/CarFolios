<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import HeroSection from '@/components/HeroSection.vue'
import FeatureCards from '@/components/FeatureCards.vue'
import BrandGrid from '@/components/BrandGrid.vue'
import CarListTabs from '@/components/CarListTabs.vue'
import TrustBadges from '@/components/TrustBadges.vue'
import LocationFilter from '@/components/LocationFilter.vue'

const router = useRouter()
const carStore = useCarStore()

// 搜索和分页
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

// Tab 切换
type TabType = 'recommend' | 'latest' | 'hot'
const activeTab = ref<TabType>('recommend')

// Hero 轮播图数据
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    alt: '豪华轿车'
  },
  {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    alt: '跑车'
  },
  {
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    alt: '经典车型'
  }
]

// 平台统计数据
const platformStats = ref({
  cars: 2680,
  cities: 56,
  deals: 12800,
  partners: 320
})

// 服务亮点数据
const features = [
  {
    icon: 'location-o',
    title: '全球车源',
    description: '覆盖全国优质车源',
    gradient: 'purple' as const
  },
  {
    icon: 'credit-pay',
    title: '安全支付',
    description: '资金担保交易',
    gradient: 'pink' as const
  },
  {
    icon: 'certificate',
    title: '专业检测',
    description: '200+项检测',
    gradient: 'blue' as const
  },
  {
    icon: 'service-o',
    title: '贴心服务',
    description: '7x24小时在线',
    gradient: 'green' as const
  }
]

// 信任徽章数据
const trustBadges = [
  { icon: 'medal-o', text: '正规资质' },
  { icon: 'shield-o', text: '安全交易' },
  { icon: 'service-o', text: '专业服务' }
]

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
  carStore.cars = []
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
  onRefresh()
}

// 打开位置筛选
function openLocationFilter() {
  showLocationFilter.value = true
}

// 品牌点击
function handleBrandSelect(brandId: number) {
  router.push({ path: '/search', query: { brandId: String(brandId) } })
}

// Tab 切换
function handleTabChange(tab: TabType) {
  activeTab.value = tab
  onRefresh()
}

import { computed } from 'vue'
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

    <!-- Hero 轮播区 -->
    <HeroSection
      :slides="heroSlides"
      :stats="platformStats"
    />

    <!-- 服务亮点 -->
    <FeatureCards :features="features" />

    <!-- 品牌快捷入口 -->
    <BrandGrid
      :brands="carStore.brands"
      :loading="carStore.loading && carStore.brands.length === 0"
      @select="handleBrandSelect"
    />

    <!-- 车源列表 Tab -->
    <CarListTabs
      :active-tab="activeTab"
      @change="handleTabChange"
    />

    <!-- 车源列表 -->
    <div class="car-list-section">
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
            <van-image 
              :src="car.coverImage || 'https://via.placeholder.com/240x180?text=No+Image'" 
              fit="cover" 
              class="car-image"
            >
              <template #error>
                <div class="image-error">
                  <van-icon name="photo-o" size="24" />
                </div>
              </template>
            </van-image>
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

    <!-- 信任徽章 -->
    <TrustBadges :badges="trustBadges" />
    
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
  background: #f5f5f5;
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

.car-list-section {
  background: #fff;
  padding: 0 16px 16px;
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
  overflow: hidden;
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

.ellipsis-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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

/* 图片加载和错误状态 */
.image-error,
.image-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  color: #999;
}
</style>
