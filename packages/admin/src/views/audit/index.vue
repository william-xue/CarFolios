<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCarStore } from '@/stores/car'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Check, Close } from '@element-plus/icons-vue'

const router = useRouter()
const carStore = useCarStore()

const loading = ref(false)

onMounted(async () => {
  await fetchPendingCars()
})

async function fetchPendingCars() {
  loading.value = true
  try {
    await carStore.fetchPendingCars({}, 1, 50)
  } finally {
    loading.value = false
  }
}

function goToDetail(id: number) {
  router.push(`/cars/${id}`)
}

async function handleApprove(id: number) {
  try {
    await ElMessageBox.confirm('确定要通过这个车源的审核吗？', '审核通过', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success',
    })
    await carStore.auditCar(id, 'approved')
    ElMessage.success('审核通过，车源已上架')
    await fetchPendingCars()
  } catch {
    // 取消
  }
}

async function handleReject(id: number) {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '审核拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入拒绝原因',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '请输入拒绝原因'
        }
        return true
      },
    })
    await carStore.auditCar(id, 'rejected', reason)
    ElMessage.success('已拒绝该车源')
    await fetchPendingCars()
  } catch {
    // 取消
  }
}

function formatPrice(price: number) {
  return price.toFixed(2) + ' 万'
}

function formatDate(date: string) {
  return date.split('T')[0]
}
</script>

<template>
  <div class="audit-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>待审核车源</span>
          <el-tag type="warning">{{ carStore.total }} 条待审核</el-tag>
        </div>
      </template>

      <el-table :data="carStore.cars" v-loading="loading" stripe>
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
        <el-table-column label="发布者" width="120">
          <template #default="{ row }">
            <div>{{ row.ownerName }}</div>
            <el-tag v-if="row.sourceType === 'personal'" size="small">个人</el-tag>
            <el-tag v-else-if="row.sourceType === 'dealer'" type="warning" size="small">车商</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="提交时间" width="120">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="goToDetail(row.id)">
              查看详情
            </el-button>
            <el-button link type="success" :icon="Check" @click="handleApprove(row.id)">
              通过
            </el-button>
            <el-button link type="danger" :icon="Close" @click="handleReject(row.id)">
              拒绝
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!loading && carStore.cars.length === 0" description="暂无待审核车源" />
    </el-card>
  </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
</style>
