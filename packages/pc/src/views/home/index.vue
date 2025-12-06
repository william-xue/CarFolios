<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import type { CarListItem } from '@/types'
import CarGrid from '@/components/CarGrid.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
const router = useRouter()
const carStore = useCarStore()

const page = ref(1)
const pageSize = 12
const hasMore = ref(true)

onMounted(async () => {
  await Promise.all([
    carStore.fetchBrands(),
    loadCars(true),
  ])
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
</script>

<template>
  <div class="home-page">
    <div class="page-container">
      <!-- 品牌快捷入口 -->
      <section class="brand-section card">
        <h2 class="section-title">{{ t('home.hotBrands') }}</h2>
        <div class="brand-list">
          <div
            v-for="brand in carStore.brands.slice(0, 12)"
            :key="brand.id"
            class="brand-item"
            @click="goToSearch(brand.id)"
          >
            <img
              v-if="brand.logo"
              :src="brand.logo"
              :alt="brand.name"
              class="brand-logo"
            />
            <div v-else class="brand-placeholder">{{ brand.name[0] }}</div>
            <span class="brand-name">{{ brand.name }}</span>
          </div>
        </div>
      </section>

      <!-- 车源列表 -->
      <section class="car-section">
        <div class="section-header">
          <h2 class="section-title">{{ t('car.recommend') }}</h2>
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  background: $bg-color-page;
}

.brand-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}

.brand-list {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;

  @media (max-width: $breakpoint-lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.brand-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: $bg-color;
  }
}

.brand-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.brand-placeholder {
  width: 48px;
  height: 48px;
  background: $bg-color;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: $text-secondary;
}

.brand-name {
  font-size: 14px;
  color: $text-regular;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.car-section {
  margin-top: 24px;
}
</style>
