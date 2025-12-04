<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useOrderStore } from '@/stores/order'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { OrderItem, OrderFilters, OrderStatus } from '@/types'
import { Search, Refresh, View } from '@element-plus/icons-vue'

const orderStore = useOrderStore()

const filters = reactive<OrderFilters>({
    keyword: '',
    status: undefined,
})

const pagination = reactive({
    page: 1,
    pageSize: 10,
})

const detailVisible = ref(false)
const currentOrder = ref<OrderItem | null>(null)

const statusOptions: { label: string; value: OrderStatus }[] = [
    { label: '待支付', value: 'pending' },
    { label: '已支付', value: 'paid' },
    { label: '已完成', value: 'closed' },
    { label: '已取消', value: 'cancelled' },
    { label: '已退款', value: 'refunded' },
]

const statusMap: Record<OrderStatus, { text: string; type: 'info' | 'warning' | 'success' | 'danger' }> = {
    pending: { text: '待支付', type: 'warning' },
    paid: { text: '已支付', type: 'info' },
    closed: { text: '已完成', type: 'success' },
    cancelled: { text: '已取消', type: 'info' },
    refunded: { text: '已退款', type: 'danger' },
}

const paymentMethodMap: Record<string, string> = {
    alipay: '支付宝',
    wechat: '微信支付',
    bank: '银行转账',
    offline: '线下支付',
}

onMounted(() => {
    fetchData()
})

async function fetchData() {
    await orderStore.fetchOrders({ ...filters, ...pagination })
}

function handleSearch() {
    pagination.page = 1
    fetchData()
}

function handleReset() {
    Object.assign(filters, { keyword: '', status: undefined })
    pagination.page = 1
    fetchData()
}

function handlePageChange(page: number) {
    pagination.page = page
    fetchData()
}

function handleViewDetail(order: OrderItem) {
    currentOrder.value = order
    detailVisible.value = true
}

async function handleComplete(order: OrderItem) {
    try {
        await ElMessageBox.confirm(`确定将订单 "${order.orderNo}" 标记为已完成吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info',
        })
        await orderStore.updateOrderStatus(order.id, 'closed')
        ElMessage.success('订单已完成')
        fetchData()
    } catch {
        // 取消
    }
}

async function handleCancel(order: OrderItem) {
    try {
        const { value } = await ElMessageBox.prompt('请输入取消原因', '取消订单', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputPlaceholder: '请输入取消原因',
        })
        await orderStore.updateOrderStatus(order.id, 'cancelled', value)
        ElMessage.success('订单已取消')
        fetchData()
    } catch {
        // 取消
    }
}

async function handleRefund(order: OrderItem) {
    try {
        await ElMessageBox.confirm(`确定为订单 "${order.orderNo}" 办理退款吗？`, '退款确认', {
            confirmButtonText: '确定退款',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await orderStore.updateOrderStatus(order.id, 'refunded')
        ElMessage.success('退款成功')
        fetchData()
    } catch {
        // 取消
    }
}

function formatDate(dateStr?: string) {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('zh-CN')
}

function formatPrice(price: number) {
    return `¥${price.toLocaleString()}`
}
</script>

<template>
  <div class="order-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="订单号/车辆/买家"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="订单状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 订单列表 -->
    <el-card>
      <el-table :data="orderStore.orders" v-loading="orderStore.loading" stripe>
        <el-table-column label="订单号" width="160">
          <template #default="{ row }">
            <span class="order-no">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="车辆信息" min-width="250">
          <template #default="{ row }">
            <div class="car-info">
              <el-image :src="row.carImage" fit="cover" class="car-image" />
              <div class="car-detail">
                <div class="car-title">{{ row.carTitle }}</div>
                <div class="car-price">{{ formatPrice(row.carPrice * 10000) }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="买家" width="120">
          <template #default="{ row }">
            <div>{{ row.buyerName }}</div>
            <div class="text-muted">{{ row.buyerMobile }}</div>
          </template>
        </el-table-column>
        <el-table-column label="卖家" width="120">
          <template #default="{ row }">
            <div>{{ row.sellerName }}</div>
            <div class="text-muted">{{ row.sellerMobile }}</div>
          </template>
        </el-table-column>
        <el-table-column label="定金" width="100">
          <template #default="{ row }">
            {{ formatPrice(row.depositAmount) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status].type" size="small">
              {{ statusMap[row.status].text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" :icon="View" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'paid'"
              type="success"
              size="small"
              @click="handleComplete(row)"
            >
              完成
            </el-button>
            <el-button
              v-if="row.status === 'pending'"
              type="warning"
              size="small"
              @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button
              v-if="row.status === 'paid'"
              type="danger"
              size="small"
              @click="handleRefund(row)"
            >
              退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="orderStore.total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="600px">
      <template v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号" :span="2">
            {{ currentOrder.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusMap[currentOrder.status].type">
              {{ statusMap[currentOrder.status].text }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="支付方式">
            {{ currentOrder.paymentMethod ? paymentMethodMap[currentOrder.paymentMethod] : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="车辆" :span="2">
            {{ currentOrder.carTitle }}
          </el-descriptions-item>
          <el-descriptions-item label="车辆价格">
            {{ formatPrice(currentOrder.carPrice * 10000) }}
          </el-descriptions-item>
          <el-descriptions-item label="定金金额">
            {{ formatPrice(currentOrder.depositAmount) }}
          </el-descriptions-item>
          <el-descriptions-item label="买家">
            {{ currentOrder.buyerName }} ({{ currentOrder.buyerMobile }})
          </el-descriptions-item>
          <el-descriptions-item label="卖家">
            {{ currentOrder.sellerName }} ({{ currentOrder.sellerMobile }})
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(currentOrder.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ formatDate(currentOrder.paidAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ formatDate(currentOrder.completedAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="取消时间">
            {{ formatDate(currentOrder.cancelledAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.cancelReason" label="取消原因" :span="2">
            {{ currentOrder.cancelReason }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.remark" label="备注" :span="2">
            {{ currentOrder.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.order-no {
  font-family: monospace;
  color: #409eff;
}

.car-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.car-image {
  width: 80px;
  height: 60px;
  border-radius: 4px;
  flex-shrink: 0;
}

.car-detail {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.car-title {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.car-price {
  color: #f56c6c;
  font-weight: 500;
}

.text-muted {
  color: #999;
  font-size: 12px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
