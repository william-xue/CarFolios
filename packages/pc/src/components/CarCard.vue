<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CarListItem } from '@/types'
import { formatGearbox, isExpiringSoon, isExpired, getRemainingDays } from '@/utils'
import { useLocale } from '@/composables/useLocale'
import { useUserStore } from '@/stores/user'
import { addFavorite, removeFavorite, checkFavorite } from '@/api/favorite'
import { ElMessage } from 'element-plus'

const { t, formatPrice, formatMileage } = useLocale()
const userStore = useUserStore()

const props = defineProps<{
    car: CarListItem
    showStatus?: boolean
    showExpireWarning?: boolean
    showFavorite?: boolean
}>()

const emit = defineEmits<{
    (e: 'click', car: CarListItem): void
    (e: 'login-required'): void
    (e: 'favorite-change', isFavorited: boolean): void
}>()

// 收藏状态
const isFavorited = ref(false)
const favoriteLoading = ref(false)

// 初始化收藏状态
async function initFavoriteStatus() {
    if (!props.showFavorite || !userStore.isLoggedIn) return
    try {
        const result = await checkFavorite(props.car.id)
        isFavorited.value = result.isFavorited
    } catch (error) {
        // 静默失败
    }
}

// 切换收藏
async function handleFavoriteClick(event: Event) {
    event.stopPropagation()
    
    if (!userStore.isLoggedIn) {
        emit('login-required')
        return
    }
    
    if (favoriteLoading.value) return
    
    favoriteLoading.value = true
    try {
        if (isFavorited.value) {
            await removeFavorite(props.car.id)
            isFavorited.value = false
            ElMessage.success(t('favorite.removeSuccess') || '已取消收藏')
        } else {
            await addFavorite(props.car.id)
            isFavorited.value = true
            ElMessage.success(t('favorite.addSuccess') || '收藏成功')
        }
        emit('favorite-change', isFavorited.value)
    } catch (error: any) {
        ElMessage.error(error.message || t('message.operationFailed'))
    } finally {
        favoriteLoading.value = false
    }
}

// 组件挂载时初始化
if (props.showFavorite) {
    initFavoriteStatus()
}

const expireStatus = computed<{ type: 'danger' | 'warning'; text: string } | null>(() => {
    if (!props.car.expireDate) return null
    if (isExpired(props.car.expireDate)) {
        return { type: 'danger', text: t('car.status.expired') }
    }
    if (isExpiringSoon(props.car.expireDate)) {
        const days = getRemainingDays(props.car.expireDate)
        return { type: 'warning', text: `${days}${t('common.mileageUnit') === 'km' ? ' days left' : '天后过期'}` }
    }
    return null
})

type CarStatus = 'pending' | 'on' | 'off' | 'sold' | 'expired'

const statusConfig = computed(() => ({
    pending: { type: 'warning' as const, text: t('car.status.pending') },
    on: { type: 'success' as const, text: t('car.status.on') },
    off: { type: 'info' as const, text: t('car.status.off') },
    sold: { type: 'info' as const, text: t('car.status.sold') },
    expired: { type: 'danger' as const, text: t('car.status.expired') },
} as Record<CarStatus, { type: 'success' | 'info' | 'warning' | 'danger'; text: string }>))

function handleClick() {
    emit('click', props.car)
}
</script>

<template>
    <div 
        class="car-card" 
        role="article"
        :aria-label="`${car.title}，价格${formatPrice(car.price)}，里程${formatMileage(car.mileage)}，${car.cityName}`"
        tabindex="0"
        @click="handleClick"
        @keydown.enter="handleClick"
    >
        <div class="car-image-wrapper">
            <el-image :src="car.coverImage" fit="cover" class="car-image" :alt="car.title">
                <template #error>
                    <div class="image-placeholder" aria-hidden="true">
                        <el-icon><Picture /></el-icon>
                    </div>
                </template>
            </el-image>
            <!-- 状态标签 -->
            <el-tag
                v-if="showStatus && car.status && statusConfig[car.status as CarStatus]"
                :type="statusConfig[car.status as CarStatus].type"
                class="status-tag"
                size="small"
            >
                {{ statusConfig[car.status as CarStatus].text }}
            </el-tag>
            <!-- 过期提醒 -->
            <el-tag
                v-if="showExpireWarning && expireStatus"
                :type="expireStatus.type"
                class="expire-tag"
                size="small"
            >
                {{ expireStatus.text }}
            </el-tag>
            <!-- 收藏按钮 -->
            <button
                v-if="showFavorite"
                class="favorite-btn"
                :class="{ 'is-favorited': isFavorited, 'is-loading': favoriteLoading }"
                :aria-label="isFavorited ? (t('favorite.remove') || '取消收藏') : (t('favorite.add') || '收藏')"
                :aria-pressed="isFavorited"
                @click="handleFavoriteClick"
            >
                <svg v-if="isFavorited" viewBox="0 0 24 24" fill="currentColor" class="heart-icon">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="heart-icon">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </button>
        </div>
        <div class="car-info">
            <h3 class="car-title ellipsis-2">{{ car.title }}</h3>
            <div class="car-tags">
                <el-tag size="small">{{ car.firstRegDate }}</el-tag>
                <el-tag size="small" type="info">{{ formatMileage(car.mileage) }}</el-tag>
                <el-tag v-if="car.gearbox" size="small" type="info">{{ formatGearbox(car.gearbox) }}</el-tag>
            </div>
            <div class="car-bottom">
                <span class="car-price">{{ formatPrice(car.price) }}</span>
                <span class="car-city">{{ car.cityName }}</span>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.car-card {
    background: #fff;
    border-radius: $border-radius-md;
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow 0.28s ease, transform 0.28s ease, filter 0.28s ease;
    will-change: transform, box-shadow;
    border: 1px solid $border-color-lighter;
    box-shadow: $box-shadow-sm;
    transform: translateZ(0);

    &:hover {
        box-shadow: $box-shadow-lg;
        transform: translateY(-6px) scale(1.01);
        filter: brightness(1.03);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(25, 137, 250, 0.25), $box-shadow-lg;
        transform: translateY(-4px) scale(1.005);
    }

    &:active {
        transform: translateY(-2px) scale(0.997);
        box-shadow: $box-shadow-md;
        filter: brightness(1);
    }
}

.car-image-wrapper {
    position: relative;
    padding-top: 75%; // 4:3 比例
}

.car-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.35s ease;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-color;
    color: $text-placeholder;
    font-size: 32px;
}

// 图片轻度缩放动效
.car-card:hover .car-image,
.car-card:focus-visible .car-image {
    transform: scale(1.03);
}

.status-tag {
    position: absolute;
    top: 8px;
    left: 8px;
}

.expire-tag {
    position: absolute;
    top: 8px;
    right: 8px;
}

.favorite-btn {
    position: absolute;
    bottom: 8px;
    right: 8px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    &:hover {
        background: #fff;
        transform: scale(1.1);
    }
    
    &.is-favorited {
        color: var(--el-color-danger);
    }
    
    &.is-loading {
        opacity: 0.6;
        pointer-events: none;
    }
    
    .heart-icon {
        width: 18px;
        height: 18px;
    }
}

.car-info {
    padding: 12px;
}

.car-title {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    margin-bottom: 8px;
    height: 40px;
    transition: color 0.25s ease;
}

.car-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
    margin-bottom: 8px;
}

.car-bottom {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.car-price {
    color: $price-color;
    font-size: 20px;
    font-weight: 600;
}

.car-city {
    font-size: 12px;
    color: $text-secondary;
}

// 文本轻度高亮
.car-card:hover .car-title,
.car-card:focus-visible .car-title {
    color: $text-primary;
}
</style>
