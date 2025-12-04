<template>
  <div class="payment-list">
    <!-- 搜索筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="queryParams" class="filter-form">
        <el-form-item label="支付单号">
          <el-input v-model="queryParams.paymentNo" placeholder="请输入支付单号" clearable />
        </el-form-item>
        <el-form-item label="订单号">
          <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable />
        </el-form-item>
        <el-form-item label="支付状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable>
            <el-option label="待支付" value="pending" />
            <el-option label="已支付" value="paid" />
            <el-option label="已关闭" value="closed" />
            <el-option label="已退款" value="refunded" />
          </el-select>
        </el-form-item>
        <el-form-item label="支付渠道">
          <el-select v-model="queryParams.channel" placeholder="全部渠道" clearable>
            <el-option label="微信支付" value="wechat" />
            <el-option label="支付宝" value="alipay" />
          </el-select>
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card>
      <el-table :data="paymentList" v-loading="loading" stripe>
        <el-table-column prop="paymentNo" label="支付单号" width="200" />
        <el-table-column prop="order.orderNo" label="订单号" width="180" />
        <el-table-column label="支付金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ (row.amount / 100).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="支付渠道" width="100">
          <template #default="{ row }">
            <el-tag :type="row.channel === 'wechat' ? 'success' : 'primary'" size="small">
              {{ channelMap[row.channel] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTypeMap[row.status]" size="small">
              {{ statusMap[row.status] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="用户" width="150">
          <template #default="{ row }">
            {{ row.user?.nickname || row.user?.mobile || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="支付时间" width="180">
          <template #default="{ row }">
            {{ row.paidAt ? formatDate(row.paidAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="showDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'paid'"
              type="danger"
              link
              size="small"
              @click="handleRefund(row)"
            >
              退款
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="支付详情" width="600px">
      <el-descriptions :column="2" border v-if="currentPayment">
        <el-descriptions-item label="支付单号">{{ currentPayment.paymentNo }}</el-descriptions-item>
        <el-descriptions-item label="订单号">{{ currentPayment.order?.orderNo }}</el-descriptions-item>
        <el-descriptions-item label="支付金额">
          <span class="amount">¥{{ (currentPayment.amount / 100).toFixed(2) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="支付渠道">{{ channelMap[currentPayment.channel] }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusTypeMap[currentPayment.status]">{{ statusMap[currentPayment.status] }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="渠道交易号">{{ currentPayment.channelTradeNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="用户">{{ currentPayment.user?.nickname || currentPayment.user?.mobile }}</el-descriptions-item>
        <el-descriptions-item label="客户端IP">{{ currentPayment.clientIp || '-' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(currentPayment.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="支付时间">{{ currentPayment.paidAt ? formatDate(currentPayment.paidAt) : '-' }}</el-descriptions-item>
        <el-descriptions-item label="退款金额" v-if="currentPayment.refundAmount">
          ¥{{ (currentPayment.refundAmount / 100).toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="退款原因" v-if="currentPayment.refundReason">
          {{ currentPayment.refundReason }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 操作日志 -->
      <div class="log-section" v-if="currentPayment?.logs?.length">
        <h4>操作日志</h4>
        <el-timeline>
          <el-timeline-item
            v-for="log in currentPayment.logs"
            :key="log.id"
            :timestamp="formatDate(log.createdAt)"
            placement="top"
          >
            <p>{{ actionMap[log.action] || log.action }}</p>
            <p v-if="log.newStatus">状态变更：{{ statusMap[log.status] }} → {{ statusMap[log.newStatus] }}</p>
            <p v-if="log.errorMessage" class="error-msg">{{ log.errorMessage }}</p>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-dialog>

    <!-- 退款弹窗 -->
    <el-dialog v-model="refundVisible" title="申请退款" width="400px">
      <el-form :model="refundForm" label-width="80px">
        <el-form-item label="退款金额">
          <el-input-number
            v-model="refundForm.amount"
            :min="1"
            :max="maxRefundAmount"
            :precision="0"
            style="width: 100%"
          />
          <div class="form-tip">最大可退：¥{{ (maxRefundAmount / 100).toFixed(2) }}</div>
        </el-form-item>
        <el-form-item label="退款原因">
          <el-input v-model="refundForm.reason" type="textarea" rows="3" placeholder="请输入退款原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundVisible = false">取消</el-button>
        <el-button type="primary" :loading="refundLoading" @click="submitRefund">确认退款</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPaymentList, getPaymentDetail, refundPayment, type PaymentItem, type PaymentQueryParams } from '@/api/payment'

// 状态映射
const statusMap: Record<string, string> = {
  pending: '待支付',
  paid: '已支付',
  closed: '已关闭',
  refunded: '已退款',
}

const statusTypeMap: Record<string, string> = {
  pending: 'warning',
  paid: 'success',
  closed: 'info',
  refunded: 'danger',
}

const channelMap: Record<string, string> = {
  wechat: '微信支付',
  alipay: '支付宝',
}

const actionMap: Record<string, string> = {
  create: '创建支付订单',
  callback: '支付回调',
  query: '查询支付状态',
  refund: '申请退款',
  close: '关闭订单',
}

// 数据
const loading = ref(false)
const paymentList = ref<PaymentItem[]>([])
const total = ref(0)
const dateRange = ref<string[]>([])

const queryParams = reactive<PaymentQueryParams>({
  page: 1,
  pageSize: 10,
  status: undefined,
  channel: undefined,
  paymentNo: '',
  orderNo: '',
  startDate: '',
  endDate: '',
})

// 详情弹窗
const detailVisible = ref(false)
const currentPayment = ref<PaymentItem | null>(null)

// 退款弹窗
const refundVisible = ref(false)
const refundLoading = ref(false)
const refundForm = reactive({
  amount: 0,
  reason: '',
})

const maxRefundAmount = computed(() => {
  if (!currentPayment.value) return 0
  return currentPayment.value.amount - (currentPayment.value.refundAmount || 0)
})

// 格式化日期
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 获取列表
const fetchList = async () => {
  loading.value = true
  try {
    const res = await getPaymentList(queryParams)
    paymentList.value = res.data.list
    total.value = res.data.total
  } catch (error) {
    ElMessage.error('获取支付列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.page = 1
  fetchList()
}

// 重置
const handleReset = () => {
  queryParams.page = 1
  queryParams.status = undefined
  queryParams.channel = undefined
  queryParams.paymentNo = ''
  queryParams.orderNo = ''
  queryParams.startDate = ''
  queryParams.endDate = ''
  dateRange.value = []
  fetchList()
}

// 日期变化
const handleDateChange = (val: string[] | null) => {
  if (val) {
    queryParams.startDate = val[0]
    queryParams.endDate = val[1]
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
}

// 查看详情
const showDetail = async (row: PaymentItem) => {
  try {
    const res = await getPaymentDetail(row.id)
    currentPayment.value = res.data
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 退款
const handleRefund = (row: PaymentItem) => {
  currentPayment.value = row
  refundForm.amount = row.amount - (row.refundAmount || 0)
  refundForm.reason = ''
  refundVisible.value = true
}

// 提交退款
const submitRefund = async () => {
  if (!currentPayment.value) return

  await ElMessageBox.confirm('确认要对该订单进行退款吗？', '提示', {
    type: 'warning',
  })

  refundLoading.value = true
  try {
    await refundPayment(currentPayment.value.id, {
      amount: refundForm.amount,
      reason: refundForm.reason,
    })
    ElMessage.success('退款申请已提交')
    refundVisible.value = false
    fetchList()
  } catch (error: any) {
    ElMessage.error(error.message || '退款失败')
  } finally {
    refundLoading.value = false
  }
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.filter-card {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.amount {
  color: #ff6b00;
  font-weight: bold;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.log-section {
  margin-top: 24px;
}

.log-section h4 {
  margin-bottom: 16px;
  color: #333;
}

.error-msg {
  color: #f56c6c;
  font-size: 12px;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}
</style>
