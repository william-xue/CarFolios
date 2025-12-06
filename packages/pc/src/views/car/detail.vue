<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import ImageGallery from '@/components/ImageGallery.vue'
import LoginModal from '@/components/LoginModal.vue'
import { formatGearbox, formatFuelType, formatDate } from '@/utils'
import { useLocale } from '@/composables/useLocale'
import { Location } from '@element-plus/icons-vue'

const { t, formatPrice, formatMileage } = useLocale()
const route = useRoute()
const router = useRouter()
const carStore = useCarStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

const loading = ref(false)
const showLoginModal = ref(false)
const bookingLoading = ref(false)
const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<any>(null)

const carId = computed(() => Number(route.params.id))
const car = computed(() => carStore.currentCar)

// 完整地址信息
const fullAddress = computed(() => {
    if (!car.value) return ''
    const parts = [
        car.value.provinceName,
        car.value.cityName,
        car.value.districtName,
        car.value.address
    ].filter(Boolean)
    return parts.join(' ')
})

// 简短位置（城市 · 区县）
const shortLocation = computed(() => {
    if (!car.value) return '-'
    const city = car.value.cityName || ''
    const district = car.value.districtName || ''
    if (city && district) return `${city} · ${district}`
    return city || district || '-'
})

// 是否有坐标信息
const hasCoordinates = computed(() => {
    return car.value?.lat && car.value?.lng
})

// 车辆图片列表
const images = computed(() => {
    if (!car.value) return []
    return car.value.images || (car.value.coverImage ? [car.value.coverImage] : [])
})

// 车辆参数
const carParams = computed(() => {
    if (!car.value) return []
    return [
        { label: t('car.firstRegDate'), value: car.value.firstRegDate || '-' },
        { label: t('car.mileage'), value: formatMileage(car.value.mileage) },
        { label: t('car.gearbox'), value: formatGearbox(car.value.gearbox || '') },
        { label: t('car.fuelType'), value: formatFuelType(car.value.fuelType || '') },
        { label: t('car.displacement'), value: car.value.displacement ? `${car.value.displacement}L` : '-' },
        { label: t('car.location'), value: shortLocation.value },
        { label: t('car.vin'), value: car.value.vin ? maskVin(car.value.vin) : '-' },
        { label: t('common.time'), value: formatDate(car.value.createdAt || '', 'date') },
    ]
})

// VIN 脱敏显示（只显示前6位和后4位）
function maskVin(vin: string): string {
    if (vin.length <= 10) return vin
    return `${vin.slice(0, 6)}*****${vin.slice(-4)}`
}

// 初始化地图
function initMap() {
    if (!mapContainer.value || !hasCoordinates.value || !car.value) return
    
    // 检查是否已加载高德地图 API
    if (typeof window.AMap === 'undefined') {
        console.warn('高德地图 API 未加载')
        return
    }
    
    try {
        const lat = car.value.lat!
        const lng = car.value.lng!
        
        mapInstance.value = new window.AMap.Map(mapContainer.value, {
            zoom: 14,
            center: [lng, lat],
            viewMode: '2D'
        })
        
        // 添加标记点
        const marker = new window.AMap.Marker({
            position: [lng, lat],
            title: car.value.title
        })
        mapInstance.value.add(marker)
        
        // 添加信息窗体
        const infoWindow = new window.AMap.InfoWindow({
            content: `<div style="padding: 8px; font-size: 14px;">${shortLocation.value}</div>`,
            offset: new window.AMap.Pixel(0, -30)
        })
        
        marker.on('click', () => {
            infoWindow.open(mapInstance.value, marker.getPosition())
        })
    } catch (error) {
        console.error('地图初始化失败:', error)
    }
}

// 销毁地图
function destroyMap() {
    if (mapInstance.value) {
        mapInstance.value.destroy()
        mapInstance.value = null
    }
}

// 加载车辆详情
async function loadCarDetail() {
    loading.value = true
    try {
        await carStore.fetchCarDetail(carId.value)
        // 延迟初始化地图，确保 DOM 已渲染
        setTimeout(() => {
            initMap()
        }, 100)
    } catch (error) {
        ElMessage.error(t('message.operationFailed'))
        router.push('/')
    } finally {
        loading.value = false
    }
}

// 预约看车
async function handleBooking() {
    if (!userStore.isLoggedIn) {
        showLoginModal.value = true
        return
    }

    try {
        await ElMessageBox.confirm(t('order.type.contact'), t('common.confirm'), {
            confirmButtonText: t('common.confirm'),
            cancelButtonText: t('common.cancel'),
            type: 'info',
        })

        bookingLoading.value = true
        await orderStore.createOrder(carId.value)
        ElMessage.success(t('message.operationSuccess'))
        router.push('/my-orders')
    } catch (error: any) {
        if (error !== 'cancel') {
            ElMessage.error(error.message || t('message.operationFailed'))
        }
    } finally {
        bookingLoading.value = false
    }
}

// 联系卖家
function handleContact() {
    if (!userStore.isLoggedIn) {
        showLoginModal.value = true
        return
    }

    if (car.value?.seller?.mobile) {
        ElMessageBox.alert(`${t('car.contactPhone')}：${car.value.seller.mobile}`, t('car.contact'), {
            confirmButtonText: t('common.confirm'),
        })
    } else {
        ElMessage.info(t('common.noData'))
    }
}

// 登录成功
function onLoginSuccess() {
    showLoginModal.value = false
    ElMessage.success(t('message.loginSuccess'))
}

onMounted(() => {
    loadCarDetail()
})

onUnmounted(() => {
    destroyMap()
})
</script>

<template>
    <div v-loading="loading" class="car-detail-page">
        <div v-if="car" class="page-container">
            <div class="detail-content">
                <!-- 左侧：图片画廊 -->
                <div class="detail-left">
                    <ImageGallery :images="images" />
                </div>

                <!-- 右侧：基本信息 -->
                <div class="detail-right">
                    <h1 class="car-title">{{ car.title }}</h1>
                    <div class="car-price">
                        <span class="price-value">{{ formatPrice(car.price) }}</span>
                    </div>

                    <!-- 快捷信息 -->
                    <div class="quick-info">
                        <div class="info-item">
                            <span class="info-label">{{ t('car.firstRegDate') }}</span>
                            <span class="info-value">{{ car.firstRegDate || '-' }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">{{ t('car.mileage') }}</span>
                            <span class="info-value">{{ formatMileage(car.mileage) }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">{{ t('car.gearbox') }}</span>
                            <span class="info-value">{{ formatGearbox(car.gearbox || '') }}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">{{ t('car.location') }}</span>
                            <span class="info-value">{{ car.cityName || '-' }}</span>
                        </div>
                    </div>

                    <!-- 卖家信息 -->
                    <div v-if="car.seller" class="seller-card card">
                        <div class="seller-info">
                            <el-avatar :src="car.seller.avatar" :size="48" />
                            <div class="seller-detail">
                                <span class="seller-name">{{ car.seller.nickname || t('user.profile') }}</span>
                                <span class="seller-label">{{ t('user.profile') }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- 操作按钮 -->
                    <div class="action-buttons">
                        <el-button size="large" @click="handleContact">
                            <el-icon><Phone /></el-icon>
                            {{ t('car.contact') }}
                        </el-button>
                        <el-button
                            type="primary"
                            size="large"
                            :loading="bookingLoading"
                            @click="handleBooking"
                        >
                            <el-icon><Calendar /></el-icon>
                            {{ t('car.viewContact') }}
                        </el-button>
                    </div>
                </div>
            </div>

            <!-- 车辆参数 -->
            <div class="params-section card">
                <h2 class="section-title">{{ t('car.detail') }}</h2>
                <div class="params-grid">
                    <div v-for="param in carParams" :key="param.label" class="param-item">
                        <span class="param-label">{{ param.label }}</span>
                        <span class="param-value">{{ param.value }}</span>
                    </div>
                </div>
            </div>

            <!-- 车辆描述 -->
            <div v-if="car.description" class="desc-section card">
                <h2 class="section-title">{{ t('car.description') }}</h2>
                <div class="desc-content">{{ car.description }}</div>
            </div>

            <!-- 位置信息 -->
            <div class="location-section card">
                <h2 class="section-title">
                    <el-icon><Location /></el-icon>
                    {{ t('car.location') }}
                </h2>
                <div class="location-content">
                    <div class="location-info">
                        <div class="location-row">
                            <span class="location-label">{{ t('car.location') }}：</span>
                            <span class="location-value">{{ shortLocation }}</span>
                        </div>
                        <div v-if="fullAddress" class="location-row">
                            <span class="location-label">{{ t('car.address') || '详细地址' }}：</span>
                            <span class="location-value">{{ fullAddress }}</span>
                        </div>
                    </div>
                    <!-- 地图展示 -->
                    <div v-if="hasCoordinates" class="map-wrapper">
                        <div ref="mapContainer" class="map-container"></div>
                    </div>
                    <div v-else class="map-placeholder">
                        <el-icon :size="48" color="#c0c4cc"><Location /></el-icon>
                        <p>{{ t('car.noMapData') || '暂无地图数据' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 登录弹窗 -->
        <LoginModal v-model:visible="showLoginModal" @success="onLoginSuccess" />
    </div>
</template>

<style lang="scss" scoped>
.car-detail-page {
    background: $bg-color-page;
    min-height: calc(100vh - $header-height - 100px);
}

.detail-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 24px;
    margin-bottom: 24px;

    @media (max-width: $breakpoint-lg) {
        grid-template-columns: 1fr;
    }
}

.detail-left {
    background: #fff;
    border-radius: $border-radius-md;
    padding: 16px;
}

.detail-right {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.car-title {
    font-size: 24px;
    font-weight: 600;
    line-height: 1.4;
    color: $text-primary;
}

.car-price {
    .price-value {
        font-size: 32px;
        font-weight: 700;
        color: $price-color;
    }
}

.quick-info {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px;
    background: #fff;
    border-radius: $border-radius-md;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.info-label {
    font-size: 12px;
    color: $text-secondary;
}

.info-value {
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
}

.seller-card {
    padding: 16px;
}

.seller-info {
    display: flex;
    align-items: center;
    gap: 12px;
}

.seller-detail {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.seller-name {
    font-size: 16px;
    font-weight: 500;
    color: $text-primary;
}

.seller-label {
    font-size: 12px;
    color: $text-secondary;
}

.action-buttons {
    display: flex;
    gap: 12px;

    .el-button {
        flex: 1;
    }
}

.params-section,
.desc-section {
    padding: 20px;
    margin-bottom: 24px;
}

.section-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid $border-color-lighter;
}

.params-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    @media (max-width: $breakpoint-lg) {
        grid-template-columns: repeat(2, 1fr);
    }
}

.param-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.param-label {
    font-size: 12px;
    color: $text-secondary;
}

.param-value {
    font-size: 14px;
    color: $text-primary;
}

.desc-content {
    font-size: 14px;
    line-height: 1.8;
    color: $text-regular;
    white-space: pre-wrap;
}

.location-section {
    padding: 20px;
    margin-bottom: 24px;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
        color: $primary-color;
    }
}

.location-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.location-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.location-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
}

.location-label {
    font-size: 14px;
    color: $text-secondary;
    flex-shrink: 0;
    min-width: 80px;
}

.location-value {
    font-size: 14px;
    color: $text-primary;
    line-height: 1.5;
}

.map-wrapper {
    border-radius: $border-radius-md;
    overflow: hidden;
    border: 1px solid $border-color-lighter;
}

.map-container {
    width: 100%;
    height: 300px;
}

.map-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background: $bg-color-page;
    border-radius: $border-radius-md;
    color: $text-secondary;
    
    p {
        margin-top: 12px;
        font-size: 14px;
    }
}
</style>
