<script setup lang="ts">
/**
 * 收藏列表页面
 * Requirements: 3.4, 3.5
 */
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getFavorites, removeFavorite, type FavoriteItem } from '@/api/favorite'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useLocale } from '@/composables/useLocale'

const { t, formatPrice, formatMileage } = useLocale()
const router = useRouter()

const favorites = ref<FavoriteItem[]>([])
const loading = ref(false)
const page = ref(1)
const pageSize = 10
const total = ref(0)

const hasMore = computed(() => favorites.value.length < total.value)

// 加载收藏列表
async function loadFavorites(reset = false) {
    if (reset) {
        page.value = 1
        favorites.value = []
    }

    loading.value = true
    try {
        const res = await getFavorites({ page: page.value, pageSize })
        if (reset) {
            favorites.value = res.list
        } else {
            favorites.value.push(...res.list)
        }
        total.value = res.total
    } catch (error: any) {
        ElMessage.error(error.message || t('message.operationFailed'))
    } finally {
        loading.value = false
    }
}

// 加载更多
function loadMore() {
    if (!hasMore.value || loading.value) return
    page.value++
    loadFavorites()
}

// 取消收藏
async function handleRemoveFavorite(item: FavoriteItem) {
    try {
        await ElMessageBox.confirm(
            t('favorite.confirmRemove') || '确定要取消收藏吗？',
            t('common.confirm'),
            {
                confirmButtonText: t('common.confirm'),
                cancelButtonText: t('common.cancel'),
                type: 'warning',
            }
        )

        await removeFavorite(item.carId)
        // 从列表中移除
        const index = favorites.value.findIndex(f => f.id === item.id)
        if (index > -1) {
            favorites.value.splice(index, 1)
            total.value--
        }
        ElMessage.success(t('favorite.removeSuccess') || '已取消收藏')
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || t('message.operationFailed'))
        }
    }
}

// 查看车辆详情
function handleViewDetail(item: FavoriteItem) {
    router.push(`/car/${item.carId}`)
}

// 判断车辆是否可用
function isCarAvailable(item: FavoriteItem): boolean {
    return item.car?.status === 'on'
}

// 获取车辆状态文本
function getCarStatusText(status: string): string {
    const statusMap: Record<string, string> = {
        on: '在售',
        off: '已下架',
        sold: '已售出',
        pending: '审核中',
        expired: '已过期',
    }
    return statusMap[status] || status
}

// 获取状态标签类型
function getStatusType(status: string): 'success' | 'info' | 'warning' | 'danger' {
    const typeMap: Record<string, 'success' | 'info' | 'warning' | 'danger'> = {
        on: 'success',
        off: 'info',
        sold: 'info',
        pending: 'warning',
        expired: 'danger',
    }
    return typeMap[status] || 'info'
}

// 格式化收藏时间
function formatFavoriteTime(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
}

onMounted(() => {
    loadFavorites(true)
})
</script>

<template>
    <div class="favorites-page">
        <div class="page-container">
            <div class="page-header">
                <h1 class="page-title">{{ t('nav.favorites') || '我的收藏' }}</h1>
                <span class="total-count">共 {{ total }} 辆</span>
            </div>

            <div v-loading="loading" class="favorites-list">
                <el-empty
                    v-if="favorites.length === 0 && !loading"
                    :description="t('favorite.empty') || '暂无收藏'"
                >
                    <el-button type="primary" @click="router.push('/search')">
                        {{ t('common.goSearch') || '去看看' }}
                    </el-button>
                </el-empty>

                <div v-for="item in favorites" :key="item.id" class="favorite-item card">
                    <div
                        class="car-image-wrapper"
                        :class="{ 'is-unavailable': !isCarAvailable(item) }"
                        @click="handleViewDetail(item)"
                    >
                        <el-image :src="item.car?.coverImage" fit="cover" class="car-image">
                            <template #error>
                                <div class="image-placeholder">
                                    <el-icon><Picture /></el-icon>
                                </div>
                            </template>
                        </el-image>
                        <div v-if="!isCarAvailable(item)" class="unavailable-mask">
                            <span>{{ getCarStatusText(item.car?.status) }}</span>
                        </div>
                    </div>
                    <div class="car-info">
                        <div class="car-header">
                            <h3 class="car-title" @click="handleViewDetail(item)">
                                {{ item.car?.title }}
                            </h3>
                            <div class="car-tags">
                                <el-tag :type="getStatusType(item.car?.status)" size="small">
                                    {{ getCarStatusText(item.car?.status) }}
                                </el-tag>
                            </div>
                        </div>
                        <div class="car-meta">
                            <span v-if="item.car?.firstRegDate">{{ item.car.firstRegDate }}</span>
                            <span v-if="item.car?.mileage">{{ formatMileage(item.car.mileage) }}</span>
                            <span v-if="item.car?.cityName">{{ item.car.cityName }}</span>
                        </div>
                        <div class="favorite-time">
                            收藏于 {{ formatFavoriteTime(item.createdAt) }}
                        </div>
                        <div class="car-footer">
                            <span class="car-price">{{ formatPrice(item.car?.price || 0) }}</span>
                            <div class="car-actions">
                                <el-button
                                    v-if="isCarAvailable(item)"
                                    type="primary"
                                    size="small"
                                    @click="handleViewDetail(item)"
                                >
                                    {{ t('common.viewDetail') || '查看详情' }}
                                </el-button>
                                <el-button
                                    size="small"
                                    type="danger"
                                    plain
                                    @click="handleRemoveFavorite(item)"
                                >
                                    {{ t('favorite.remove') || '取消收藏' }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 加载更多 -->
                <div v-if="hasMore && favorites.length > 0" class="load-more">
                    <el-button :loading="loading" @click="loadMore">
                        {{ t('common.loadMore') || '加载更多' }}
                    </el-button>
                </div>
                <div v-else-if="favorites.length > 0" class="no-more">
                    {{ t('common.noMore') || '没有更多了' }}
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.favorites-page {
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
    margin: 0;
}

.total-count {
    color: $text-secondary;
    font-size: 14px;
}

.favorites-list {
    min-height: 200px;
}

.favorite-item {
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
    cursor: pointer;
    position: relative;

    &.is-unavailable {
        .car-image {
            filter: grayscale(100%);
            opacity: 0.7;
        }
    }
}

.car-image {
    width: 100%;
    height: 100%;
    transition: transform 0.3s ease;
}

.unavailable-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 14px;
    font-weight: 500;
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
    cursor: pointer;
    transition: color 0.25s ease;

    &:hover {
        color: $primary-color;
    }
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
    margin-bottom: 8px;
    line-height: 1;
}

.favorite-time {
    font-size: 12px;
    color: $text-placeholder;
    margin-bottom: auto;
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
