<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CarListItem } from '@/types'
import { formatCarStatus, isExpiringSoon, isExpired, getRemainingDays } from '@/utils'
import { useLocale } from '@/composables/useLocale'

const { t, formatPrice, formatMileage } = useLocale()
const router = useRouter()
const carStore = useCarStore()

const page = ref(1)
const pageSize = 10
const hasMore = ref(true)

// 加载我的车源
async function loadMyCars(reset = false) {
    if (reset) {
        page.value = 1
        hasMore.value = true
    }

    const res = await carStore.fetchMyCars({ page: page.value, pageSize })
    hasMore.value = res.list.length === pageSize && carStore.cars.length < res.total
}

// 加载更多
function loadMore() {
    if (!hasMore.value || carStore.loading) return
    page.value++
    loadMyCars()
}

// 编辑车源
function handleEdit(car: CarListItem) {
    router.push(`/car/edit/${car.id}`)
}

// 切换状态
async function handleToggleStatus(car: CarListItem) {
    const newStatus = car.status === 'on' ? 'off' : 'on'
    const actionText = newStatus === 'on' ? t('car.onShelf') : t('car.offShelf')

    try {
        await ElMessageBox.confirm(`${t('common.confirm')} ${actionText}?`, t('common.confirm'), {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
        })

        await carStore.toggleCarStatus(car.id, newStatus)
        ElMessage.success(t('message.operationSuccess'))
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || t('message.operationFailed'))
        }
    }
}

// 续期
async function handleRenew(car: CarListItem) {
    try {
        await ElMessageBox.confirm(t('common.confirm'), t('common.confirm'), {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'info',
        })

        await carStore.renewCar(car.id)
        ElMessage.success(t('message.operationSuccess'))
        loadMyCars(true)
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || t('message.operationFailed'))
        }
    }
}

// 删除
async function handleDelete(car: CarListItem) {
    try {
        await ElMessageBox.confirm(t('message.confirmDelete'), t('common.confirm'), {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'warning',
        })

        await carStore.deleteCar(car.id)
        ElMessage.success(t('message.deleteSuccess'))
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || t('message.operationFailed'))
        }
    }
}

// 获取状态标签类型
function getStatusType(status: string): 'success' | 'info' | 'warning' | 'danger' {
    const typeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
        pending: 'warning',
        on: 'success',
        off: 'info',
        sold: 'info',
        expired: 'danger',
    }
    return typeMap[status] || 'info'
}

// 获取过期状态
function getExpireInfo(car: CarListItem) {
    if (!car.expireDate) return null
    if (isExpired(car.expireDate)) {
        return { type: 'danger' as const, text: '已过期' }
    }
    if (isExpiringSoon(car.expireDate)) {
        const days = getRemainingDays(car.expireDate)
        return { type: 'warning' as const, text: `${days}天后过期` }
    }
    return null
}

onMounted(() => {
    loadMyCars(true)
})
</script>

<template>
    <div class="my-cars-page">
        <div class="page-container">
            <div class="page-header">
                <h1 class="page-title">{{ t('nav.myCars') }}</h1>
                <el-button type="primary" @click="router.push('/publish')">
                    <el-icon><Plus /></el-icon>
                    {{ t('nav.publish') }}
                </el-button>
            </div>

            <div v-loading="carStore.loading" class="car-list">
                <el-empty v-if="carStore.cars.length === 0 && !carStore.loading" :description="t('common.noData')" />

                <div v-for="car in carStore.cars" :key="car.id" class="car-item card">
                    <div class="car-image-wrapper">
                        <el-image :src="car.coverImage" fit="cover" class="car-image">
                            <template #error>
                                <div class="image-placeholder">
                                    <el-icon><Picture /></el-icon>
                                </div>
                            </template>
                        </el-image>
                    </div>
                    <div class="car-info">
                        <div class="car-header">
                            <h3 class="car-title">{{ car.title }}</h3>
                            <div class="car-tags">
                                <el-tag :type="getStatusType(car.status)" size="small">
                                    {{ formatCarStatus(car.status) }}
                                </el-tag>
                                <el-tag
                                    v-if="getExpireInfo(car)"
                                    :type="getExpireInfo(car)!.type"
                                    size="small"
                                >
                                    {{ getExpireInfo(car)!.text }}
                                </el-tag>
                            </div>
                        </div>
                        <div class="car-meta">
                            <span>{{ car.firstRegDate }}</span>
                            <span>{{ formatMileage(car.mileage) }}</span>
                            <span>{{ car.cityName }}</span>
                        </div>
                        <div class="car-footer">
                            <span class="car-price">{{ formatPrice(car.price) }}</span>
                            <div class="car-actions">
                                <el-button size="small" @click="handleEdit(car)">{{ t('common.edit') }}</el-button>
                                <el-button
                                    v-if="car.status === 'on'"
                                    size="small"
                                    @click="handleToggleStatus(car)"
                                >
                                    {{ t('car.offShelf') }}
                                </el-button>
                                <el-button
                                    v-else-if="car.status === 'off'"
                                    size="small"
                                    type="primary"
                                    @click="handleToggleStatus(car)"
                                >
                                    {{ t('car.onShelf') }}
                                </el-button>
                                <el-button
                                    v-if="car.expireDate && (isExpiringSoon(car.expireDate) || isExpired(car.expireDate))"
                                    size="small"
                                    type="warning"
                                    @click="handleRenew(car)"
                                >
                                    {{ t('common.more') }}
                                </el-button>
                                <el-button size="small" type="danger" @click="handleDelete(car)">
                                    {{ t('common.delete') }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 加载更多 -->
                <div v-if="hasMore && carStore.cars.length > 0" class="load-more">
                    <el-button :loading="carStore.loading" @click="loadMore">{{ t('common.more') }}</el-button>
                </div>
                <div v-else-if="carStore.cars.length > 0" class="no-more">{{ t('common.noData') }}</div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.my-cars-page {
    background: $bg-color-page;
    min-height: calc(100vh - $header-height - 100px);
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.page-title {
    font-size: 24px;
    font-weight: 600;
}

.car-list {
    min-height: 200px;
}

.car-item {
    display: flex;
    gap: 16px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fff;
    border-radius: $border-radius-md;
    border: 1px solid $border-color-lighter;
    transition: all 0.28s ease;
    will-change: transform, box-shadow;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: $box-shadow-md;
        border-color: rgba($primary-color, 0.2);
        
        .car-image {
            transform: scale(1.03);
        }
        
        .car-title {
            color: $primary-color;
        }
    }
}

.car-image-wrapper {
    flex-shrink: 0;
    width: 200px;
    height: 150px;
    border-radius: $border-radius-md;
    overflow: hidden;
}

.car-image {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
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

.car-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.car-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
}

.car-title {
    font-size: 16px;
    font-weight: 500;
    flex: 1;
    margin: 0;
    margin-right: 16px;
    transition: color 0.25s ease;
}

.car-tags {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
    align-items: center;
}

.car-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: auto;
    line-height: 1;
}

.car-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 12px;
}

.car-price {
    font-size: 20px;
    font-weight: 600;
    color: $price-color;
}

.car-actions {
    display: flex;
    gap: 8px;
}

.load-more {
    text-align: center;
    padding: 24px 0;
}

.no-more {
    text-align: center;
    padding: 24px 0;
    color: $text-placeholder;
    font-size: 14px;
}
</style>
