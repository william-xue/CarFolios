<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface HeroSlide {
  image: string
  alt: string
}

interface PlatformStats {
  cars: number
  cities: number
  deals: number
  partners: number
}

const props = withDefaults(defineProps<{
  slides: HeroSlide[]
  stats: PlatformStats
  autoplayDelay?: number
}>(), {
  autoplayDelay: 4000
})

const emit = defineEmits<{
  (e: 'search'): void
}>()

const currentSlide = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null
let pauseTimer: ReturnType<typeof setTimeout> | null = null

function startAutoplay() {
  stopAutoplay()
  autoplayTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % props.slides.length
  }, props.autoplayDelay)
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

function handleTouchStart() {
  stopAutoplay()
  if (pauseTimer) {
    clearTimeout(pauseTimer)
  }
}

function handleTouchEnd() {
  pauseTimer = setTimeout(() => {
    startAutoplay()
  }, 3000)
}

function formatNumber(num: number): string {
  return num.toLocaleString()
}

onMounted(() => {
  if (props.slides.length > 1) {
    startAutoplay()
  }
})

onUnmounted(() => {
  stopAutoplay()
  if (pauseTimer) {
    clearTimeout(pauseTimer)
  }
})
</script>

<template>
  <div class="hero-section">
    <!-- 轮播背景 -->
    <div class="hero-slides">
      <div
        v-for="(slide, index) in slides"
        :key="index"
        :class="['hero-slide', { active: currentSlide === index }]"
        :style="{ backgroundImage: `url(${slide.image})` }"
      />
    </div>
    
    <!-- 遮罩层 -->
    <div class="hero-overlay" />
    
    <!-- 轮播指示器 -->
    <div v-if="slides.length > 1" class="slide-indicators">
      <span
        v-for="(_, index) in slides"
        :key="index"
        :class="['indicator', { active: currentSlide === index }]"
        @click="currentSlide = index"
      />
    </div>
    
    <!-- 内容区 -->
    <div 
      class="hero-content"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <h1 class="hero-title">爱车出海</h1>
      <p class="hero-subtitle">全球二手车交易平台</p>
      
      <!-- 统计数据 -->
      <div class="hero-stats">
        <div class="stat-item">
          <span class="stat-number">{{ formatNumber(stats.cars) }}+</span>
          <span class="stat-label">优质车源</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-number">{{ stats.cities }}+</span>
          <span class="stat-label">覆盖城市</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-number">{{ formatNumber(stats.deals) }}+</span>
          <span class="stat-label">成交量</span>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <span class="stat-number">{{ stats.partners }}+</span>
          <span class="stat-label">合作商家</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.hero-slides {
  position: absolute;
  inset: 0;
}

.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1.1);
  transition: opacity 0.8s ease-in-out, transform 5s ease-out;
}

.hero-slide.active {
  opacity: 1;
  transform: scale(1);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 20, 40, 0.85) 0%,
    rgba(20, 40, 80, 0.75) 50%,
    rgba(15, 52, 96, 0.8) 100%
  );
  z-index: 1;
}

.slide-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.indicator {
  width: 20px;
  height: 3px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
}

.indicator:hover {
  background: rgba(255, 255, 255, 0.7);
}

.indicator.active {
  background: #fff;
  width: 32px;
}

.hero-content {
  position: relative;
  z-index: 5;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  color: #fff;
  text-align: center;
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 4px;
  margin-bottom: 8px;
  background: linear-gradient(180deg, #fff 0%, #e8e8e8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2px;
  margin-bottom: 24px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-number {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.stat-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.2);
}
</style>
