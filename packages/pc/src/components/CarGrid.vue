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
        showFavorite?: boolean
    }>(),
    {
        loading: false,
        hasMore: false,
        showStatus: false,
        showExpireWarning: false,
        showFavorite: false,
    }
)

const emit = defineEmits<{
    (e: 'load-more'): void
    (e: 'click-car', car: CarListItem): void
    (e: 'login-required'): void
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
        <!-- 骨架屏加载态（仅在初始加载且无数据时显示） -->
        <div v-if="loading && cars.length === 0" class="car-grid">
            <div v-for="i in 8" :key="i" class="skeleton-card">
                <el-skeleton animated>
                    <template #template>
                        <el-skeleton-item variant="image" style="width: 100%; height: 200px" />
                        <div style="padding: 12px">
                            <el-skeleton-item variant="h3" style="width: 80%; margin-bottom: 8px" />
                            <div style="display: flex; gap: 8px; margin-bottom: 8px">
                                <el-skeleton-item variant="text" style="width: 20%" />
                                <el-skeleton-item variant="text" style="width: 20%" />
                            </div>
                            <div style="display: flex; justify-content: space-between">
                                <el-skeleton-item variant="text" style="width: 30%" />
                                <el-skeleton-item variant="text" style="width: 20%" />
                            </div>
                        </div>
                    </template>
                </el-skeleton>
            </div>
        </div>

        <!-- 真实数据 -->
        <div v-else-if="cars.length > 0" class="car-grid">
            <CarCard
                v-for="car in cars"
                :key="car.id"
                :car="car"
                :show-status="showStatus"
                :show-expire-warning="showExpireWarning"
                :show-favorite="showFavorite"
                @click="handleCarClick"
                @login-required="emit('login-required')"
            />
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-state">
            <el-empty description="暂无车源" />
        </div>

        <!-- 底部加载中（加载更多时显示） -->
        <div v-if="loading && cars.length > 0" class="loading-state">
            <el-icon class="is-loading"><Loading /></el-icon>
            <span>加载中...</span>
        </div>

        <!-- 没有更多 -->
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

.skeleton-card {
    background: #fff;
    border-radius: $border-radius-md;
    overflow: hidden;
    border: 1px solid $border-color-lighter;
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
