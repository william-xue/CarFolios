<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { CarListItem } from '@/types'
import CarCard from './CarCard.vue'

const props = withDefaults(
    defineProps<{
        cars: CarListItem[]
        loading?: boolean
        hasMore?: boolean
        showStatus?: boolean
        showExpireWarning?: boolean
    }>(),
    {
        loading: false,
        hasMore: false,
        showStatus: false,
        showExpireWarning: false,
    }
)

const emit = defineEmits<{
    (e: 'load-more'): void
    (e: 'click-car', car: CarListItem): void
}>()

const containerRef = ref<HTMLElement | null>(null)

function handleScroll() {
    if (!props.hasMore || props.loading) return

    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    // 距离底部 200px 时触发加载
    if (scrollTop + windowHeight >= documentHeight - 200) {
        emit('load-more')
    }
}

onMounted(() => {
    window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

function handleCarClick(car: CarListItem) {
    emit('click-car', car)
}
</script>

<template>
    <div ref="containerRef" class="car-grid-container">
        <div v-if="cars.length === 0 && !loading" class="empty-state">
            <el-empty description="暂无车源" />
        </div>
        <div v-else class="car-grid">
            <CarCard
                v-for="car in cars"
                :key="car.id"
                :car="car"
                :show-status="showStatus"
                :show-expire-warning="showExpireWarning"
                @click="handleCarClick"
            />
        </div>
        <div v-if="loading" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
        </div>
        <div v-else-if="!hasMore && cars.length > 0" class="no-more">
            <span>没有更多了</span>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.car-grid-container {
    width: 100%;
}

.car-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    @media (max-width: $breakpoint-xl) {
        grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: $breakpoint-lg) {
        grid-template-columns: repeat(2, 1fr);
    }

    @media (max-width: $breakpoint-md) {
        grid-template-columns: 1fr;
    }
}

.empty-state {
    padding: 60px 0;
}

.loading-state {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 24px 0;
    color: $text-secondary;
}

.no-more {
    text-align: center;
    padding: 24px 0;
    color: $text-placeholder;
    font-size: 14px;
}
</style>
