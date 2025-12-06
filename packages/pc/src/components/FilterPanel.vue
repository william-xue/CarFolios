<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Brand } from '@/types'
import { Search } from '@element-plus/icons-vue'
import LocationSelector from './LocationSelector.vue'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()

defineProps<{
    brands?: Brand[]
}>()

const emit = defineEmits<{
    (e: 'search', params: FilterParams): void
    (e: 'reset'): void
}>()

interface FilterParams {
    keyword: string
    brandId: number | null
    priceMin: number | null
    priceMax: number | null
    provinceCode: string | null
    cityCode: string | null
    districtCode: string | null
}

const keyword = ref('')
const brandId = ref<number | null>(null)
const priceMin = ref<number | null>(null)
const priceMax = ref<number | null>(null)
const location = ref<string[]>([])

// 价格区间预设
const priceRanges = computed(() => [
    { label: `5${t('common.yuan')}${t('filter.unlimited') === 'Any' ? ' or less' : '以下'}`, min: 0, max: 50000 },
    { label: `5-10${t('common.yuan')}`, min: 50000, max: 100000 },
    { label: `10-20${t('common.yuan')}`, min: 100000, max: 200000 },
    { label: `20-30${t('common.yuan')}`, min: 200000, max: 300000 },
    { label: `30-50${t('common.yuan')}`, min: 300000, max: 500000 },
    { label: `50${t('common.yuan')}${t('filter.unlimited') === 'Any' ? '+' : '以上'}`, min: 500000, max: null },
])

function selectPriceRange(range: { min: number; max: number | null }) {
    priceMin.value = range.min
    priceMax.value = range.max
    handleSearch()
}

function handleSearch() {
    emit('search', {
        keyword: keyword.value,
        brandId: brandId.value,
        priceMin: priceMin.value,
        priceMax: priceMax.value,
        provinceCode: location.value[0] || null,
        cityCode: location.value[1] || null,
        districtCode: location.value[2] || null,
    })
}

function handleReset() {
    keyword.value = ''
    brandId.value = null
    priceMin.value = null
    priceMax.value = null
    location.value = []
    emit('reset')
}

function handleLocationChange(codes: string[]) {
    location.value = codes
    handleSearch()
}

// 监听品牌变化
watch(brandId, () => {
    handleSearch()
})
</script>

<template>
    <div class="filter-panel card" role="search" :aria-label="t('filter.title')">
        <!-- 搜索框 -->
        <div class="filter-row">
            <label class="filter-label" id="keyword-label">{{ t('common.search') }}</label>
            <div class="filter-content">
                <el-input
                    v-model="keyword"
                    :placeholder="t('home.searchPlaceholder')"
                    clearable
                    aria-labelledby="keyword-label"
                    aria-describedby="keyword-desc"
                    @keyup.enter="handleSearch"
                    @clear="handleSearch"
                >
                    <template #append>
                        <el-button :icon="Search" :aria-label="t('common.search')" @click="handleSearch" />
                    </template>
                </el-input>
                <span id="keyword-desc" class="sr-only">{{ t('home.searchPlaceholder') }}</span>
            </div>
        </div>

        <!-- 品牌筛选 -->
        <div class="filter-row">
            <label class="filter-label" id="brand-label">{{ t('filter.brand') }}</label>
            <div class="filter-content">
                <el-select
                    v-model="brandId"
                    :placeholder="t('common.all')"
                    clearable
                    filterable
                    style="width: 200px"
                    aria-labelledby="brand-label"
                >
                    <el-option
                        v-for="brand in brands"
                        :key="brand.id"
                        :label="brand.name"
                        :value="brand.id"
                    />
                </el-select>
            </div>
        </div>

        <!-- 价格区间 -->
        <div class="filter-row">
            <label class="filter-label" id="price-label">{{ t('filter.priceRange') }}</label>
            <div class="filter-content">
                <div class="price-ranges" role="group" aria-label="快速选择价格区间">
                    <el-tag
                        v-for="range in priceRanges"
                        :key="range.label"
                        :type="priceMin === range.min && priceMax === range.max ? 'primary' : 'info'"
                        class="price-tag"
                        role="button"
                        tabindex="0"
                        :aria-pressed="priceMin === range.min && priceMax === range.max"
                        @click="selectPriceRange(range)"
                        @keydown.enter="selectPriceRange(range)"
                    >
                        {{ range.label }}
                    </el-tag>
                </div>
                <div class="price-inputs">
                    <el-input-number
                        v-model="priceMin"
                        :min="0"
                        :max="9999999"
                        placeholder="最低价"
                        controls-position="right"
                        @change="handleSearch"
                    />
                    <span class="price-separator">-</span>
                    <el-input-number
                        v-model="priceMax"
                        :min="0"
                        :max="9999999"
                        placeholder="最高价"
                        controls-position="right"
                        @change="handleSearch"
                    />
                    <span class="price-unit">元</span>
                </div>
            </div>
        </div>

        <!-- 地区筛选 -->
        <div class="filter-row">
            <label class="filter-label" id="location-label">{{ t('filter.location') }}</label>
            <div class="filter-content">
                <LocationSelector
                    :model-value="location"
                    aria-labelledby="location-label"
                    @update:model-value="handleLocationChange"
                />
            </div>
        </div>

        <!-- 操作按钮 -->
        <div class="filter-actions" role="group" :aria-label="t('filter.title')">
            <el-button :aria-label="t('filter.clear')" @click="handleReset">{{ t('common.reset') }}</el-button>
            <el-button type="primary" :aria-label="t('filter.apply')" @click="handleSearch">{{ t('common.search') }}</el-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.filter-panel {
    padding: 20px;
}

.filter-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;

    &:last-child {
        margin-bottom: 0;
    }
}

.filter-label {
    width: 80px;
    flex-shrink: 0;
    font-size: 14px;
    color: $text-regular;
    line-height: 32px;
}

.filter-content {
    flex: 1;
}

.price-ranges {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 12px;
}

.price-tag {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        opacity: 0.8;
    }
}

.price-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
}

.price-separator {
    color: $text-placeholder;
}

.price-unit {
    color: $text-secondary;
    font-size: 14px;
}

.filter-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid $border-color-lighter;
}
</style>
