<script setup lang="ts">
import CarGrid from '@/components/CarGrid.vue'
import { useLocale } from '@/composables/useLocale'
import { useCarStore } from '@/stores/car'
import type { CarListItem } from '@/types'
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const { t } = useLocale()
const router = useRouter()
const carStore = useCarStore()

const page = ref(1)
const pageSize = 12
const hasMore = ref(true)
const activeTab = ref('recommend')
const currentSlide = ref(0)

// Hero 轮播背景图（使用高质量汽车图片）
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1920&q=80',
    alt: '豪华轿车'
  },
  {
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80',
    alt: '跑车'
  },
  {
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&q=80',
    alt: '经典车型'
  },
  {
    image: 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=1920&q=80',
    alt: 'SUV'
  },
]

// 自动轮播
let slideTimer: ReturnType<typeof setInterval> | null = null

function startSlideTimer() {
  slideTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % heroSlides.length
  }, 5000)
}

function stopSlideTimer() {
  if (slideTimer) {
    clearInterval(slideTimer)
    slideTimer = null
  }
}

// 模拟统计数据（后续可从API获取）
const stats = ref({
  cars: 2680,
  countries: 56,
  deals: 12800,
  partners: 320,
})

onMounted(async () => {
  startSlideTimer()
  await Promise.all([
    carStore.fetchBrands(),
    loadCars(true),
  ])
})

onUnmounted(() => {
  stopSlideTimer()
})

async function loadCars(reset = false) {
  if (reset) {
    page.value = 1
    hasMore.value = true
  }
  const res = await carStore.fetchCars({ page: page.value, pageSize })
  hasMore.value = res.list.length === pageSize && carStore.cars.length < res.total
}

function loadMore() {
  if (!hasMore.value || carStore.loading) return
  page.value++
  loadCars()
}

function handleCarClick(car: CarListItem) {
  router.push(`/car/${car.id}`)
}

function goToSearch(brandId?: number) {
  if (brandId) {
    router.push({ name: 'Search', query: { brandId: String(brandId) } })
  } else {
    router.push('/search')
  }
}

function handleTabChange(tab: string) {
  activeTab.value = tab
  loadCars(true)
}
</script>

<template>
  <div class="home-page">
    <!-- Hero 区域 -->
    <section class="hero-section" @mouseenter="stopSlideTimer" @mouseleave="startSlideTimer">
      <!-- 轮播背景 -->
      <div class="hero-slides">
        <div
          v-for="(slide, index) in heroSlides"
          :key="index"
          :class="['hero-slide', { active: currentSlide === index }]"
          :style="{ backgroundImage: `url(${slide.image})` }"
        ></div>
      </div>
      <div class="hero-overlay"></div>
      
      <!-- 轮播指示器 -->
      <div class="slide-indicators">
        <span
          v-for="(_, index) in heroSlides"
          :key="index"
          :class="['indicator', { active: currentSlide === index }]"
          @click="currentSlide = index"
        ></span>
      </div>
      
      <div class="hero-content">
        <h1 class="hero-title">{{ t('home.banner.title') }}</h1>
        <p class="hero-subtitle">{{ t('home.banner.subtitle') }}</p>
        <el-button type="primary" size="large" class="hero-cta" @click="goToSearch()">
          {{ t('home.banner.cta') }}
          <el-icon class="el-icon--right"><ArrowRight /></el-icon>
        </el-button>
        
        <!-- 核心数据 -->
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{ stats.cars.toLocaleString() }}+</span>
            <span class="stat-label">{{ t('home.stats.cars') }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.countries }}+</span>
            <span class="stat-label">{{ t('home.stats.countries') }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.deals.toLocaleString() }}+</span>
            <span class="stat-label">{{ t('home.stats.deals') }}</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-number">{{ stats.partners }}+</span>
            <span class="stat-label">{{ t('home.stats.partners') }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 服务亮点区 -->
    <section class="features-section">
      <div class="page-container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon global">
              <el-icon><Location /></el-icon>
            </div>
            <h3 class="feature-title">{{ t('home.features.global.title') }}</h3>
            <p class="feature-desc">{{ t('home.features.global.desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon payment">
              <el-icon><CreditCard /></el-icon>
            </div>
            <h3 class="feature-title">{{ t('home.features.payment.title') }}</h3>
            <p class="feature-desc">{{ t('home.features.payment.desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon inspection">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <h3 class="feature-title">{{ t('home.features.inspection.title') }}</h3>
            <p class="feature-desc">{{ t('home.features.inspection.desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon service">
              <el-icon><Headset /></el-icon>
            </div>
            <h3 class="feature-title">{{ t('home.features.service.title') }}</h3>
            <p class="feature-desc">{{ t('home.features.service.desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="page-container">
      <!-- 品牌快捷入口 -->
      <section class="brand-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('home.hotBrands') }}</h2>
          <el-button text type="primary" @click="goToSearch()">
            {{ t('home.viewMore') }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <div class="brand-list">
          <div
            v-for="brand in carStore.brands.slice(0, 10)"
            :key="brand.id"
            class="brand-item"
            @click="goToSearch(brand.id)"
          >
            <div class="brand-logo-wrapper">
              <img
                v-if="brand.logo"
                :src="brand.logo"
                :alt="brand.name"
                class="brand-logo"
              />
              <div v-else class="brand-placeholder">{{ brand.name[0] }}</div>
            </div>
            <span class="brand-name">{{ brand.name }}</span>
          </div>
        </div>
      </section>

      <!-- 车源列表 -->
      <section class="car-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('car.recommend') }}</h2>
          <div class="section-tabs">
            <span 
              :class="['tab-item', { active: activeTab === 'recommend' }]"
              @click="handleTabChange('recommend')"
            >{{ t('home.tabs.recommend') }}</span>
            <span 
              :class="['tab-item', { active: activeTab === 'latest' }]"
              @click="handleTabChange('latest')"
            >{{ t('home.tabs.latest') }}</span>
            <span 
              :class="['tab-item', { active: activeTab === 'hot' }]"
              @click="handleTabChange('hot')"
            >{{ t('home.tabs.hot') }}</span>
          </div>
          <el-button text type="primary" @click="goToSearch()">
            {{ t('home.viewMore') }}
            <el-icon><ArrowRight /></el-icon>
          </el-button>
        </div>
        <CarGrid
          :cars="carStore.cars"
          :loading="carStore.loading"
          :has-more="hasMore"
          @load-more="loadMore"
          @click-car="handleCarClick"
        />
      </section>

      <!-- 信任徽章区 -->
      <section class="trust-section">
        <div class="trust-badges">
          <div class="trust-badge">
            <el-icon class="trust-icon"><Medal /></el-icon>
            <span class="trust-text">{{ t('home.trust.license') }}</span>
          </div>
          <div class="trust-badge">
            <el-icon class="trust-icon"><Lock /></el-icon>
            <span class="trust-text">{{ t('home.trust.secure') }}</span>
          </div>
          <div class="trust-badge">
            <el-icon class="trust-icon"><Service /></el-icon>
            <span class="trust-text">{{ t('home.trust.support') }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  background: $bg-color-page;
}

// Hero 区域
.hero-section {
  position: relative;
  height: 420px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    background-size: 50px 50px;
  }
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 100%);
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
  padding: 0 24px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 20px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 20px;
  color: rgba(255,255,255,0.85);
  margin-bottom: 32px;
  font-weight: 400;
}

.hero-cta {
  font-size: 16px;
  padding: 14px 40px;
  border-radius: 30px;
  background: linear-gradient(135deg, $primary-color 0%, #0066cc 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(25, 137, 250, 0.4);
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(25, 137, 250, 0.5);
  }
}

.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32px;
  margin-top: 48px;
  padding: 24px 48px;
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.15);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255,255,255,0.2);
}

// 服务亮点区
.features-section {
  background: #fff;
  padding: 48px 0;
  margin-top: -40px;
  position: relative;
  z-index: 2;
  border-radius: 24px 24px 0 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  
  @media (max-width: $breakpoint-lg) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.feature-card {
  text-align: center;
  padding: 32px 24px;
  border-radius: 16px;
  background: $bg-color-page;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: $box-shadow-md;
  }
}

.feature-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #fff;
  
  &.global {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  &.payment {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }
  &.inspection {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }
  &.service {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.6;
}

// 品牌区
.brand-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: $text-primary;
}

.section-tabs {
  display: flex;
  gap: 24px;
}

.tab-item {
  font-size: 14px;
  color: $text-secondary;
  cursor: pointer;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  
  &:hover {
    color: $primary-color;
  }
  
  &.active {
    color: $primary-color;
    border-bottom-color: $primary-color;
    font-weight: 500;
  }
}

.brand-list {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 12px;

  @media (max-width: $breakpoint-lg) {
    grid-template-columns: repeat(5, 1fr);
  }
  
  @media (max-width: $breakpoint-sm) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.brand-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: $bg-color-page;

  &:hover {
    background: #fff;
    box-shadow: $box-shadow-md;
    transform: translateY(-2px);
  }
}

.brand-logo-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-placeholder {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, $primary-color 0%, #0066cc 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.brand-name {
  font-size: 13px;
  color: $text-regular;
  text-align: center;
}

// 车源区
.car-section {
  margin-top: 24px;
  background: #fff;
  border-radius: 16px;
  padding: 24px;
}

// 信任徽章区
.trust-section {
  margin: 40px 0;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 64px;
  padding: 32px;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
  border-radius: 16px;
  border: 1px solid $border-color-lighter;
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.trust-icon {
  font-size: 28px;
  color: $primary-color;
}

.trust-text {
  font-size: 15px;
  color: $text-primary;
  font-weight: 500;
}
</style>
