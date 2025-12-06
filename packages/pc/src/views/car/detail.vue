<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import ImageGallery from '@/components/ImageGallery.vue'
import LoginModal from '@/components/LoginModal.vue'
import { formatGearbox, formatFuelType, formatDate } from '@/utils'
import { useLocale } from '@/composables/useLocale'

const { t, formatPrice, formatMileage } = useLocale()
const route = useRoute()
const router = useRouter()
const carStore = useCarStore()
const userStore = useUserStore()
const orderStore = useOrderStore()

const loading = ref(false)
const showLoginModal = ref(false)
const bookingLoading = ref(false)

const carId = computed(() => Number(route.params.id))
const car = computed(() => carStore.currentCar)

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
        { label: t('car.location'), value: `${car.value.provinceName || ''} ${car.value.cityName || ''}` },
        { label: t('car.vin'), value: car.value.vin || '-' },
        { label: t('common.time'), value: formatDate(car.value.createdAt || '', 'date') },
    ]
})

// 加载车辆详情
async function loadCarDetail() {
    loading.value = true
    try {
        await carStore.fetchCarDetail(carId.value)
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
</style>
