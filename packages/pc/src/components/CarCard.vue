<script setup lang="ts">
import { computed } from 'vue'
import type { CarListItem } from '@/types'
import { formatGearbox, isExpiringSoon, isExpired, getRemainingDays } from '@/utils'
import { useLocale } from '@/composables/useLocale'

const { t, formatPrice, formatMileage } = useLocale()

const props = defineProps<{
    car: CarListItem
    showStatus?: boolean
    showExpireWarning?: boolean
}>()

const emit = defineEmits<{
    (e: 'click', car: CarListItem): void
}>()

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
