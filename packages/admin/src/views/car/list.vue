<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, ArrowDown, CircleCheck, CircleClose, Delete } from '@element-plus/icons-vue'
import type { CarStatus, SourceType } from '@/types'

const router = useRouter()
const carStore = useCarStore()

const filters = reactive({
  keyword: '',
  brandId: undefined as number | undefined,
  status: undefined as CarStatus | undefined,
  sourceType: undefined as SourceType | undefined,
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
})

const statusOptions = [
  { label: '全部', value: undefined },
  { label: '已上架', value: 'on' },
  { label: '已下架', value: 'off' },
  { label: '待审核', value: 'pending' },
  { label: '已售出', value: 'sold' },
  { label: '已拒绝', value: 'rejected' },
]

const sourceTypeOptions = [
  { label: '全部', value: undefined },
  { label: '平台自营', value: 'platform' },
  { label: '个人车主', value: 'personal' },
  { label: '车商', value: 'dealer' },
]

const statusTagType: Record<string, string> = {
  on: 'success',
  off: 'info',
  pending: 'warning',
  sold: '',
  rejected: 'danger',
  draft: 'info',
  approved: 'success',
}

const statusText: Record<string, string> = {
  on: '已上架',
  off: '已下架',
  pending: '待审核',
  sold: '已售出',
  rejected: '已拒绝',
  draft: '草稿',
  approved: '已通过',
}

onMounted(async () => {
  await carStore.fetchBrands()
  await fetchData()
})

async function fetchData() {
  await carStore.fetchCars(filters, pagination.page, pagination.pageSize)
}

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  filters.keyword = ''
  filters.brandId = undefined
  filters.status = undefined
  filters.sourceType = undefined
  pagination.page = 1
  fetchData()
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchData()
}

function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.page = 1
  fetchData()
}

function goToCreate() {
  router.push('/cars/create')
}

function goToDetail(id: number) {
  router.push(`/cars/${id}`)
}

function goToEdit(id: number) {
  router.push(`/cars/${id}/edit`)
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个车源吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await carStore.deleteCar(id)
    ElMessage.success('删除成功')
    fetchData()
  } catch {
    // 取消
  }
}

async function handleStatusChange(id: number, command: string) {
  if (command === 'delete') {
    handleDelete(id)
    return
  }
  if (command === 'on' || command === 'off') {
    await carStore.toggleCarStatus(id, command)
  }
  ElMessage.success('状态更新成功')
  fetchData()
}

function formatPrice(price: number) {
  return price.toFixed(2) + ' 万'
}

function formatDate(date: string) {
  return date.split('T')[0]
}
</script>

<template>
  <div class="car-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="filters" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="车辆标题/品牌"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="品牌">
          <el-select v-model="filters.brandId" placeholder="全部" clearable style="width: 140px">
            <el-option
              v-for="brand in carStore.brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value ?? 'all'"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="来源">
          <el-select v-model="filters.sourceType" placeholder="全部" clearable style="width: 120px">
            <el-option
              v-for="opt in sourceTypeOptions"
              :key="opt.value ?? 'all'"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" :icon="Plus" @click="goToCreate">发布车源</el-button>
    </div>

    <!-- 表格 -->
    <el-card>
      <el-table :data="carStore.cars" v-loading="carStore.loading" stripe>
        <el-table-column label="车辆信息" min-width="300">
          <template #default="{ row }">
            <div class="car-info">
              <el-image
                :src="row.coverImage"
                fit="cover"
                class="car-cover"
                :preview-src-list="[row.coverImage]"
              />
              <div class="car-detail">
                <div class="car-title">{{ row.title }}</div>
                <div class="car-meta">
                  <span>{{ row.cityName }}</span>
                  <span>{{ row.mileage }}万公里</span>
                  <span>{{ row.firstRegDate }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="100">
          <template #default="{ row }">
            <span class="price">{{ formatPrice(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.sourceType === 'platform'" type="primary" size="small">平台</el-tag>
            <el-tag v-else-if="row.sourceType === 'personal'" size="small">个人</el-tag>
            <el-tag v-else type="warning" size="small">车商</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]" size="small">
              {{ statusText[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button link type="primary" size="small" @click="goToDetail(row.id)">
                查看
              </el-button>
              <el-button link type="primary" size="small" @click="goToEdit(row.id)">
                编辑
              </el-button>
              <el-dropdown trigger="click" @command="(cmd: string) => handleStatusChange(row.id, cmd as CarStatus)">
                <el-button link type="primary" size="small">
                  更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="row.status !== 'on'" command="on">
                      <el-icon><CircleCheck /></el-icon>上架
                    </el-dropdown-item>
                    <el-dropdown-item v-if="row.status === 'on'" command="off">
                      <el-icon><CircleClose /></el-icon>下架
                    </el-dropdown-item>
                    <el-dropdown-item v-if="row.status !== 'sold'" command="sold">
                      <el-icon><Sold /></el-icon>标记已售
                    </el-dropdown-item>
                    <el-dropdown-item divided command="delete" style="color: #f56c6c">
                      <el-icon><Delete /></el-icon>删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="carStore.total"
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
.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-bar {
  margin-bottom: 16px;
}

.car-info {
  display: flex;
  gap: 12px;
}

.car-cover {
  width: 120px;
  height: 80px;
  border-radius: 4px;
  flex-shrink: 0;
}

.car-detail {
  flex: 1;
  min-width: 0;
}

.car-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.car-meta {
  font-size: 12px;
  color: #999;
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

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-buttons .el-button {
  padding: 4px 8px;
}
</style>
