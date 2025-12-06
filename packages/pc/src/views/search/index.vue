<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import type { CarListItem } from '@/types'
import FilterPanel from '@/components/FilterPanel.vue'
import CarGrid from '@/components/CarGrid.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
const route = useRoute()
const router = useRouter()
const carStore = useCarStore()

const page = ref(1)
const pageSize = 12
const hasMore = ref(true)

// 筛选参数
const filterParams = ref({
    keyword: '',
    brandId: null as number | null,
    priceMin: null as number | null,
    priceMax: null as number | null,
    provinceCode: null as string | null,
    cityCode: null as string | null,
    districtCode: null as string | null,
})

// 从 URL 参数初始化筛选条件
function initFromQuery() {
    const query = route.query
    if (query.keyword) {
        filterParams.value.keyword = String(query.keyword)
    }
    if (query.brandId) {
        filterParams.value.brandId = Number(query.brandId)
    }
    if (query.priceMin) {
        filterParams.value.priceMin = Number(query.priceMin)
    }
    if (query.priceMax) {
        filterParams.value.priceMax = Number(query.priceMax)
    }
    if (query.provinceCode) {
        filterParams.value.provinceCode = String(query.provinceCode)
    }
    if (query.cityCode) {
        filterParams.value.cityCode = String(query.cityCode)
    }
}

// 加载车源列表
async function loadCars(reset = false) {
    if (reset) {
        page.value = 1
        hasMore.value = true
    }

    const res = await carStore.fetchCars({
        page: page.value,
        pageSize,
        keyword: filterParams.value.keyword || undefined,
        brandId: filterParams.value.brandId || undefined,
        priceMin: filterParams.value.priceMin || undefined,
        priceMax: filterParams.value.priceMax || undefined,
        provinceCode: filterParams.value.provinceCode || undefined,
        cityCode: filterParams.value.cityCode || undefined,
        districtCode: filterParams.value.districtCode || undefined,
    })

    hasMore.value = res.list.length === pageSize && carStore.cars.length < res.total
}

// 加载更多
function loadMore() {
    if (!hasMore.value || carStore.loading) return
    page.value++
    loadCars()
}

// 搜索
function handleSearch(params: typeof filterParams.value) {
    filterParams.value = params
    // 更新 URL 参数
    const query: Record<string, string> = {}
    if (params.keyword) query.keyword = params.keyword
    if (params.brandId) query.brandId = String(params.brandId)
    if (params.priceMin) query.priceMin = String(params.priceMin)
    if (params.priceMax) query.priceMax = String(params.priceMax)
    if (params.provinceCode) query.provinceCode = params.provinceCode
    if (params.cityCode) query.cityCode = params.cityCode

    router.replace({ query })
    loadCars(true)
}

// 重置筛选
function handleReset() {
    filterParams.value = {
        keyword: '',
        brandId: null,
        priceMin: null,
        priceMax: null,
        provinceCode: null,
        cityCode: null,
        districtCode: null,
    }
    router.replace({ query: {} })
    loadCars(true)
}

// 点击车源卡片
function handleCarClick(car: CarListItem) {
    router.push(`/car/${car.id}`)
}

onMounted(async () => {
    await carStore.fetchBrands()
    initFromQuery()
    loadCars(true)
})

// 监听路由参数变化
watch(
    () => route.query,
    () => {
        initFromQuery()
        loadCars(true)
    }
)
</script>

<template>
    <div class="search-page">
        <div class="page-container">
            <!-- 筛选面板 -->
            <FilterPanel
                :brands="carStore.brands"
                @search="handleSearch"
                @reset="handleReset"
            />

            <!-- 搜索结果 -->
            <div class="search-results">
                <div class="results-header">
                    <span class="results-count">{{ t('common.total', { count: carStore.total }) }}</span>
                </div>
                <CarGrid
                    :cars="carStore.cars"
                    :loading="carStore.loading"
                    :has-more="hasMore"
                    @load-more="loadMore"
                    @click-car="handleCarClick"
                />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.search-page {
    background: $bg-color-page;
}

.search-results {
    margin-top: 24px;
}

.results-header {
    margin-bottom: 16px;
}

.results-count {
    font-size: 14px;
    color: $text-secondary;
}
</style>
