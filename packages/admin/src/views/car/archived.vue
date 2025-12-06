<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, FolderOpened, RefreshRight, Delete } from '@element-plus/icons-vue'
import { getArchivedCars, restoreArchivedCar, deleteArchivedCar } from '@/api/car'

interface ArchivedCar {
  id: number
  originalId: number
  data: {
    title: string
    brandName: string
    seriesName: string
    cityName: string
    price: number
    coverImage: string
    ownerName: string
    expiresAt: string
  }
  archivedAt: string
  archivedBy: string
}

const loading = ref(false)
const archivedCars = ref<ArchivedCar[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)

// 加载归档车辆列表
async function loadArchivedCars() {
  loading.value = true
  try {
    const result = await getArchivedCars({
      page: page.value,
      pageSize: pageSize.value
    })
    archivedCars.value = result.list
    total.value = result.total
  } catch (error) {
    console.error('加载归档车辆失败:', error)
    ElMessage.error('加载归档车辆失败')
  } finally {
    loading.value = false
  }
}

// 恢复归档车辆
async function handleRestore(car: ArchivedCar) {
  try {
    await ElMessageBox.confirm(
      `确定要恢复车辆「${car.data.title}」吗？恢复后将重新上架。`,
      '恢复确认',
      { confirmButtonText: '确定恢复', cancelButtonText: '取消', type: 'info' }
    )
    await restoreArchivedCar(car.id)
    ElMessage.success('恢复成功，车辆已重新上架')
    loadArchivedCars()
  } catch {
    // 取消
  }
}

// 永久删除
async function handleDelete(car: ArchivedCar) {
  try {
    await ElMessageBox.confirm(
      `确定要永久删除车辆「${car.data.title}」吗？此操作不可恢复！`,
      '永久删除',
      { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
    )
    await deleteArchivedCar(car.id)
    ElMessage.success('删除成功')
    loadArchivedCars()
  } catch {
    // 取消
  }
}

// 分页变化
function handlePageChange(newPage: number) {
  page.value = newPage
  loadArchivedCars()
}

function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  page.value = 1
  loadArchivedCars()
}

// 格式化日期
function formatDate(date?: string) {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadArchivedCars()
})
</script>

<template>
  <div class="archived-cars-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><FolderOpened /></el-icon>
            归档车辆管理
          </span>
          <el-button type="primary" @click="loadArchivedCars" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </template>

      <el-alert
        title="归档说明"
        type="info"
        description="过期超过30天的车辆会被自动归档。归档车辆可以恢复上架，也可以永久删除。"
        show-icon
        :closable="false"
        style="margin-bottom: 16px;"
      />

      <el-table :data="archivedCars" v-loading="loading" stripe>
        <el-table-column prop="originalId" label="原ID" width="80" />
        <el-table-column label="车辆信息" min-width="250">
          <template #default="{ row }">
            <div class="car-info">
              <el-image :src="row.data.coverImage" fit="cover" class="car-image" />
              <div class="car-detail">
                <div class="car-title">{{ row.data.title }}</div>
                <div class="car-meta">
                  <span>{{ row.data.brandName }} {{ row.data.seriesName }}</span>
                  <span>{{ row.data.cityName }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }">
            <span class="price">{{ row.data.price }}万</span>
          </template>
        </el-table-column>
        <el-table-column label="原车主" width="100">
          <template #default="{ row }">
            {{ row.data.ownerName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="归档时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.archivedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="archivedBy" label="归档方式" width="100">
          <template #default="{ row }">
            <el-tag size="small" :type="row.archivedBy === 'system' ? 'info' : 'primary'">
              {{ row.archivedBy === 'system' ? '系统自动' : '手动' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" :icon="RefreshRight" @click="handleRestore(row)">
                恢复
              </el-button>
              <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && archivedCars.length === 0" description="暂无归档车辆" />

      <div v-if="total > 0" class="pagination">
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
