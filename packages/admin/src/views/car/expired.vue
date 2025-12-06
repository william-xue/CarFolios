<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Refresh, Delete, Timer } from '@element-plus/icons-vue'
import { getCars, renewCar, deleteCar } from '@/api/car'
import type { Car, PageResult } from '@/types'

const router = useRouter()
const loading = ref(false)
const cars = ref<Car[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// 加载过期车辆列表
async function loadExpiredCars() {
  loading.value = true
  try {
    const result: PageResult<Car> = await getCars({
      status: 'expired',
      page: page.value,
      pageSize: pageSize.value
    })
    cars.value = result.list
    total.value = result.total
  } finally {
    loading.value = false
  }
}

// 计算过期天数
function getExpiredDays(expiresAt?: string): number {
  if (!expiresAt) return 0
  const now = new Date()
  const expires = new Date(expiresAt)
  const diff = now.getTime() - expires.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

// 查看详情
function viewDetail(id: number) {
  router.push(`/cars/${id}`)
}

// 续期车辆
async function handleRenew(car: Car) {
  try {
    await ElMessageBox.confirm(
      `确定要续期车辆「${car.title}」吗？续期后将重新上架30天。`,
      '续期确认',
      { confirmButtonText: '确定续期', cancelButtonText: '取消', type: 'info' }
    )
    await renewCar(car.id)
    ElMessage.success('续期成功，车辆已重新上架')
    loadExpiredCars()
  } catch {
    // 取消
  }
}

// 删除车辆
async function handleDelete(car: Car) {
  try {
    await ElMessageBox.confirm(
      `确定要删除车辆「${car.title}」吗？删除后无法恢复。`,
      '删除确认',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    await deleteCar(car.id)
    ElMessage.success('删除成功')
    loadExpiredCars()
  } catch {
    // 取消
  }
}

// 分页变化
function handlePageChange(newPage: number) {
  page.value = newPage
  loadExpiredCars()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  loadExpiredCars()
}

// 格式化日期
function formatDate(date?: string) {
  return date ? date.split('T')[0] : '-'
}

onMounted(() => {
  loadExpiredCars()
})
</script>

<template>
  <div class="expired-cars-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Timer /></el-icon>
            过期车辆管理
          </span>
          <el-button type="primary" @click="loadExpiredCars" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-table :data="cars" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="车辆信息" min-width="250">
          <template #default="{ row }">
            <div class="car-info">
              <el-image :src="row.coverImage" fit="cover" class="car-image" />
              <div class="car-detail">
                <div class="car-title">{{ row.title }}</div>
                <div class="car-meta">
                  <span>{{ row.brandName }} {{ row.seriesName }}</span>
                  <span>{{ row.cityName }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="100">
          <template #default="{ row }">
            <span class="price">{{ row.price }}万</span>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.expiresAt) }}
          </template>
        </el-table-column>
        <el-table-column label="过期天数" width="100">
          <template #default="{ row }">
            <el-tag type="danger" size="small">
              {{ getExpiredDays(row.expiresAt) }}天
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ownerName" label="车主" width="100" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" :icon="View" @click="viewDetail(row.id)">
                查看
              </el-button>
              <el-button size="small" type="primary" :icon="Refresh" @click="handleRenew(row)">
                续期
              </el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.car-info {
  display: flex;
  gap: 12px;
  align-items: center;
}

.car-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  flex-shrink: 0;
}

.car-detail {
  flex: 1;
  overflow: hidden;
}

.car-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.car-meta {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  display: flex;
  gap: 12px;
}

.price {
  color: #f56c6c;
  font-weight: 600;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
