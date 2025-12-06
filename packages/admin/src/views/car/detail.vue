<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Timer, Location, Document } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'
import type { CarStatus } from '@/types'

const route = useRoute()
const router = useRouter()
const carStore = useCarStore()

const carId = computed(() => Number(route.params.id))
const loading = ref(true)

const statusTagType: Record<string, string> = {
  on: 'success',
  off: 'info',
  pending: 'warning',
  sold: '',
  rejected: 'danger',
}

const statusText: Record<string, string> = {
  on: '已上架',
  off: '已下架',
  pending: '待审核',
  sold: '已售出',
  rejected: '已拒绝',
}

const gearboxText: Record<string, string> = {
  MT: '手动',
  AT: '自动',
  DCT: '双离合',
  CVT: 'CVT',
}

const useTypeText: Record<string, string> = {
  family: '家用',
  business: '商务',
  official: '公务',
}

onMounted(async () => {
  try {
    await carStore.fetchCarDetail(carId.value)
  } finally {
    loading.value = false
  }
})

function goToEdit() {
  router.push(`/cars/${carId.value}/edit`)
}

async function handleStatusChange(status: CarStatus) {
  if (status === 'on' || status === 'off') {
    await carStore.toggleCarStatus(carId.value, status)
  } else if (status === 'sold') {
    // 标记已售需要调用专门的接口
    await carStore.updateCar(carId.value, { status: 'sold' })
  }
  ElMessage.success('状态更新成功')
  await carStore.fetchCarDetail(carId.value)
}

async function handleDelete() {
  try {
    await ElMessageBox.confirm('确定要删除这个车源吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await carStore.deleteCar(carId.value)
    ElMessage.success('删除成功')
    router.push('/cars')
  } catch {
    // 取消
  }
}

function formatPrice(price?: number) {
  return price ? price.toFixed(2) + ' 万' : '-'
}

function formatDate(date?: string) {
  return date ? date.split('T')[0] : '-'
}

function formatDateTime(date?: string) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 计算剩余天数
function getRemainingDays(expiresAt?: string): number | null {
  if (!expiresAt) return null
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = expires.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// 获取有效期状态
const expiryStatus = computed(() => {
  const car = carStore.currentCar
  if (!car?.expiresAt) return null
  const days = getRemainingDays(car.expiresAt)
  if (days === null) return null
  if (days <= 0) return { type: 'danger', text: '已过期' }
  if (days <= 3) return { type: 'danger', text: `${days}天后过期` }
  if (days <= 7) return { type: 'warning', text: `${days}天后过期` }
  return { type: 'success', text: `剩余${days}天` }
})

// 完整地址
const fullAddress = computed(() => {
  const car = carStore.currentCar
  if (!car) return '-'
  const parts = [car.provinceName, car.cityName, car.districtName, car.address].filter(Boolean)
  return parts.join(' ') || '-'
})
</script>

<template>
  <div class="car-detail" v-loading="loading">
    <template v-if="carStore.currentCar">
      <el-card class="header-card">
        <div class="header-content">
          <div class="header-info">
            <h1 class="title">{{ carStore.currentCar.title }}</h1>
            <div class="meta">
              <el-tag :type="statusTagType[carStore.currentCar.status]">
                {{ statusText[carStore.currentCar.status] }}
              </el-tag>
              <span class="price">{{ formatPrice(carStore.currentCar.price) }}</span>
            </div>
          </div>
          <div class="header-actions">
            <el-button type="primary" :icon="Edit" @click="goToEdit">编辑</el-button>
            <el-dropdown trigger="click" @command="handleStatusChange">
              <el-button>更改状态</el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-if="carStore.currentCar.status !== 'on'" command="on">
                    上架
                  </el-dropdown-item>
                  <el-dropdown-item v-if="carStore.currentCar.status === 'on'" command="off">
                    下架
                  </el-dropdown-item>
                  <el-dropdown-item v-if="carStore.currentCar.status !== 'sold'" command="sold">
                    标记已售
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-button type="danger" :icon="Delete" @click="handleDelete">删除</el-button>
          </div>
        </div>
      </el-card>

      <el-row :gutter="24">
        <el-col :span="16">
          <!-- 图片 -->
          <el-card class="images-card">
            <template #header>车辆图片</template>
            <div class="images-grid">
              <el-image
                v-for="(img, index) in carStore.currentCar.images"
                :key="index"
                :src="img"
                fit="cover"
                class="car-image"
                :preview-src-list="carStore.currentCar.images"
                :initial-index="index"
              />
            </div>
          </el-card>

          <!-- 车辆亮点 -->
          <el-card class="desc-card">
            <template #header>车辆亮点</template>
            <p class="highlight-desc">{{ carStore.currentCar.highlightDesc || '暂无描述' }}</p>
          </el-card>

          <!-- 车辆配置 -->
          <el-card v-if="carStore.currentCar.configs?.length" class="config-card">
            <template #header>车辆配置</template>
            <div class="config-list">
              <el-tag v-for="config in carStore.currentCar.configs" :key="config" class="config-tag">
                {{ config }}
              </el-tag>
            </div>
          </el-card>
        </el-col>

        <el-col :span="8">
          <!-- 基本信息 -->
          <el-card class="info-card">
            <template #header>基本信息</template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="品牌车系">
                {{ carStore.currentCar.brandName }} {{ carStore.currentCar.seriesName }}
              </el-descriptions-item>
              <el-descriptions-item label="车型">
                {{ carStore.currentCar.modelName }}
              </el-descriptions-item>
              <el-descriptions-item label="上牌时间">
                {{ carStore.currentCar.firstRegDate }}
              </el-descriptions-item>
              <el-descriptions-item label="行驶里程">
                {{ carStore.currentCar.mileage }} 万公里
              </el-descriptions-item>
              <el-descriptions-item label="排量">
                {{ carStore.currentCar.displacement }}L
              </el-descriptions-item>
              <el-descriptions-item label="变速箱">
                {{ gearboxText[carStore.currentCar.gearbox] }}
              </el-descriptions-item>
              <el-descriptions-item label="排放标准">
                {{ carStore.currentCar.emissionStandard }}
              </el-descriptions-item>
              <el-descriptions-item label="车辆用途">
                {{ useTypeText[carStore.currentCar.useType] }}
              </el-descriptions-item>
              <el-descriptions-item label="过户次数">
                {{ carStore.currentCar.transferCount }} 次
              </el-descriptions-item>
              <el-descriptions-item label="车身颜色">
                {{ carStore.currentCar.color || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="车牌归属">
                {{ carStore.currentCar.plateCity || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 价格信息 -->
          <el-card class="info-card">
            <template #header>价格信息</template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="售价">
                <span class="price-value">{{ formatPrice(carStore.currentCar.price) }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="新车指导价">
                {{ formatPrice(carStore.currentCar.originalPrice) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- VIN 和车牌信息 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Document /></el-icon>
                <span>车辆识别信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="VIN 车架号">
                <span class="vin-code">{{ carStore.currentCar.vin || '-' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="车牌号">
                {{ carStore.currentCar.plateNumber || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="发动机号">
                {{ carStore.currentCar.engineNumber || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 位置信息 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Location /></el-icon>
                <span>位置信息</span>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="省份">
                {{ carStore.currentCar.provinceName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="城市">
                {{ carStore.currentCar.cityName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="区县">
                {{ carStore.currentCar.districtName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="完整地址">
                {{ fullAddress }}
              </el-descriptions-item>
              <el-descriptions-item v-if="carStore.currentCar.lat && carStore.currentCar.lng" label="坐标">
                {{ carStore.currentCar.lat }}, {{ carStore.currentCar.lng }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 有效期信息 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <el-icon><Timer /></el-icon>
                <span>有效期信息</span>
                <el-tag v-if="expiryStatus" :type="expiryStatus.type" size="small" class="expiry-tag">
                  {{ expiryStatus.text }}
                </el-tag>
              </div>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="发布时间">
                {{ formatDateTime(carStore.currentCar.publishedAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="到期时间">
                {{ formatDateTime(carStore.currentCar.expiresAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="续期次数">
                {{ carStore.currentCar.renewalCount || 0 }} 次
              </el-descriptions-item>
              <el-descriptions-item v-if="carStore.currentCar.renewedAt" label="最后续期">
                {{ formatDateTime(carStore.currentCar.renewedAt) }}
              </el-descriptions-item>
              <el-descriptions-item v-if="carStore.currentCar.soldAt" label="售出时间">
                {{ formatDateTime(carStore.currentCar.soldAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 其他信息 -->
          <el-card class="info-card">
            <template #header>其他信息</template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="车源来源">
                <el-tag v-if="carStore.currentCar.sourceType === 'platform'" type="primary" size="small">
                  平台自营
                </el-tag>
                <el-tag v-else-if="carStore.currentCar.sourceType === 'personal'" size="small">
                  个人车主
                </el-tag>
                <el-tag v-else type="warning" size="small">车商</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="发布者">
                {{ carStore.currentCar.ownerName }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(carStore.currentCar.createdAt) }}
              </el-descriptions-item>
              <el-descriptions-item label="更新时间">
                {{ formatDate(carStore.currentCar.updatedAt) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
      </el-row>
    </template>

    <el-empty v-else-if="!loading" description="车源不存在" />
  </div>
</template>

<style scoped>
.header-card {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 16px;
}

.price {
  font-size: 24px;
  font-weight: 600;
  color: #f56c6c;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.images-card,
.desc-card,
.config-card,
.info-card {
  margin-bottom: 24px;
}

.images-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.car-image {
  width: 100%;
  height: 150px;
  border-radius: 4px;
  cursor: pointer;
}

.highlight-desc {
  margin: 0;
  line-height: 1.8;
  color: #666;
}

.config-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.config-tag {
  margin: 0;
}

.price-value {
  color: #f56c6c;
  font-weight: 600;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header .el-icon {
  color: #409eff;
}

.expiry-tag {
  margin-left: auto;
}

.vin-code {
  font-family: 'Courier New', monospace;
  font-weight: 500;
  letter-spacing: 1px;
}
</style>
