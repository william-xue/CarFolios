<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { usePlatformUserStore } from '@/stores/platform-user'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { PlatformUser, UserFilters, RoleType, AuthStatus, UserStatus } from '@/types'
import { Search, Refresh } from '@element-plus/icons-vue'

const userStore = usePlatformUserStore()

const filters = reactive<UserFilters>({
    keyword: '',
    roleType: undefined,
    authStatus: undefined,
    status: undefined,
})

const pagination = reactive({
    page: 1,
    pageSize: 10,
})

const roleOptions: { label: string; value: RoleType }[] = [
    { label: '买家', value: 'buyer' },
    { label: '卖家', value: 'seller' },
    { label: '车商', value: 'dealer' },
]

const authStatusOptions: { label: string; value: AuthStatus }[] = [
    { label: '未认证', value: 'unverified' },
    { label: '认证中', value: 'pending' },
    { label: '已认证', value: 'verified' },
    { label: '认证失败', value: 'rejected' },
]

const statusOptions: { label: string; value: UserStatus }[] = [
    { label: '正常', value: 'enabled' },
    { label: '禁用', value: 'disabled' },
]

const roleMap: Record<RoleType, string> = {
    buyer: '买家',
    seller: '卖家',
    dealer: '车商',
    admin: '管理员',
}

const authStatusMap: Record<AuthStatus, { text: string; type: 'success' | 'warning' | 'info' | 'danger' }> = {
    unverified: { text: '未认证', type: 'info' },
    pending: { text: '认证中', type: 'warning' },
    verified: { text: '已认证', type: 'success' },
    rejected: { text: '认证失败', type: 'danger' },
}

onMounted(() => {
    fetchData()
})

async function fetchData() {
    await userStore.fetchUsers({ ...filters, ...pagination })
}

function handleSearch() {
    pagination.page = 1
    fetchData()
}

function handleReset() {
    Object.assign(filters, { keyword: '', roleType: undefined, authStatus: undefined, status: undefined })
    pagination.page = 1
    fetchData()
}

function handlePageChange(page: number) {
    pagination.page = page
    fetchData()
}

async function handleToggleStatus(user: PlatformUser) {
    const newStatus = user.status === 'enabled' ? 0 : 1  // 0=禁用, 1=启用
    const action = newStatus === 0 ? '禁用' : '启用'
    
    try {
        await ElMessageBox.confirm(`确定要${action}用户 "${user.nickname}" 吗？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await userStore.updateUserStatus(user.id, newStatus)
        ElMessage.success(`${action}成功`)
        fetchData()
    } catch {
        // 取消
    }
}

async function handleApproveAuth(user: PlatformUser) {
    try {
        await ElMessageBox.confirm(`确定通过用户 "${user.nickname}" 的实名认证吗？`, '提示', {
            confirmButtonText: '通过',
            cancelButtonText: '取消',
            type: 'info',
        })
        await userStore.updateUserAuth(user.id, 'verified')
        ElMessage.success('认证通过')
        fetchData()
    } catch {
        // 取消
    }
}

async function handleRejectAuth(user: PlatformUser) {
    try {
        await ElMessageBox.confirm(`确定拒绝用户 "${user.nickname}" 的实名认证吗？`, '提示', {
            confirmButtonText: '拒绝',
            cancelButtonText: '取消',
            type: 'warning',
        })
        await userStore.updateUserAuth(user.id, 'rejected')
        ElMessage.success('已拒绝认证')
        fetchData()
    } catch {
        // 取消
    }
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('zh-CN')
}
</script>

<template>
  <div class="user-list">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="关键词">
          <el-input
            v-model="filters.keyword"
            placeholder="昵称/手机号/姓名"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="filters.roleType" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="opt in roleOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="认证状态">
          <el-select v-model="filters.authStatus" placeholder="全部" clearable style="width: 120px">
            <el-option v-for="opt in authStatusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态">
          <el-select v-model="filters.status" placeholder="全部" clearable style="width: 100px">
            <el-option v-for="opt in statusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 用户列表 -->
    <el-card>
      <el-table :data="userStore.users" v-loading="userStore.loading" stripe>
        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="40" :src="row.avatar" />
              <div class="user-detail">
                <div class="nickname">{{ row.nickname }}</div>
                <div class="mobile">{{ row.mobile }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="实名信息" min-width="150">
          <template #default="{ row }">
            <div v-if="row.realName">
              <div>{{ row.realName }}</div>
              <div class="text-muted">{{ row.idCard }}</div>
            </div>
            <span v-else class="text-muted">未填写</span>
          </template>
        </el-table-column>
        <el-table-column label="角色" width="80">
          <template #default="{ row }">
            {{ roleMap[row.roleType] }}
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="100">
          <template #default="{ row }">
            <el-tag :type="authStatusMap[row.authStatus].type" size="small">
              {{ authStatusMap[row.authStatus].text }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="账号状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'danger'" size="small">
              {{ row.status === 'enabled' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="余额" width="100">
          <template #default="{ row }">
            ¥{{ row.balance.toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="订单/车源" width="100">
          <template #default="{ row }">
            {{ row.totalOrders }} / {{ row.totalCars }}
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.authStatus === 'pending'"
              type="success"
              size="small"
              @click="handleApproveAuth(row)"
            >
              通过认证
            </el-button>
            <el-button
              v-if="row.authStatus === 'pending'"
              type="warning"
              size="small"
              @click="handleRejectAuth(row)"
            >
              拒绝
            </el-button>
            <el-button
              :type="row.status === 'enabled' ? 'danger' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          :page-size="pagination.pageSize"
          :total="userStore.total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.search-card {
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-detail {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-weight: 500;
}

.mobile {
  font-size: 12px;
  color: #999;
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
