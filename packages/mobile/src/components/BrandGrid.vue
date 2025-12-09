<script setup lang="ts">
import { computed } from 'vue'

interface Brand {
  id: number
  name: string
  logo?: string
}

const props = withDefaults(defineProps<{
  brands: Brand[]
  maxCount?: number
  loading?: boolean
}>(), {
  maxCount: 8,
  loading: false
})

const emit = defineEmits<{
  (e: 'select', brandId: number): void
}>()

const displayBrands = computed(() => {
  return props.brands.slice(0, props.maxCount)
})

function handleBrandClick(brandId: number) {
  emit('select', brandId)
}
</script>

<template>
  <div class="brand-grid-section">
    <div class="section-header">
      <span class="section-title">热门品牌</span>
      <span class="section-more">
        更多
        <van-icon name="arrow" />
      </span>
    </div>
    
    <!-- 骨架屏 -->
    <div v-if="loading" class="brand-grid">
      <div v-for="i in maxCount" :key="i" class="brand-item skeleton">
        <div class="brand-logo-skeleton" />
        <div class="brand-name-skeleton" />
      </div>
    </div>
    
    <!-- 品牌列表 -->
    <div v-else class="brand-grid">
      <div
        v-for="brand in displayBrands"
        :key="brand.id"
        class="brand-item"
        @click="handleBrandClick(brand.id)"
      >
        <div class="brand-logo-wrapper">
          <img
            v-if="brand.logo"
            :src="brand.logo"
            :alt="brand.name"
            class="brand-logo"
          />
          <div v-else class="brand-placeholder">
            {{ brand.name[0] }}
          </div>
        </div>
        <span class="brand-name">{{ brand.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.brand-grid-section {
  background: #fff;
  padding: 16px;
  margin-top: 12px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-more {
  font-size: 12px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 2px;
}

.brand-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 12px;
}

.brand-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.brand-item:active {
  opacity: 0.7;
}

.brand-logo-wrapper {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
}

.brand-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.brand-placeholder {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1989fa 0%, #0066cc 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}

.brand-name {
  font-size: 12px;
  color: #666;
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 骨架屏样式 */
.brand-item.skeleton {
  pointer-events: none;
}

.brand-logo-skeleton {
  width: 48px;
  height: 48px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 12px;
}

.brand-name-skeleton {
  width: 40px;
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
