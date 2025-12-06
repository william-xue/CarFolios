<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import {
    Checked,
    Expand,
    Fold,
    FolderOpened,
    List,
    Odometer,
    SwitchButton,
    Timer,
    User,
    Van,
    Wallet,
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isCollapse = ref(false)

const menuItems = [
  { path: '/dashboard', title: '工作台', icon: Odometer },
  { path: '/cars', title: '车源管理', icon: Van },
  { path: '/audit', title: '审核中心', icon: Checked },
  { path: '/expired-cars', title: '过期车辆', icon: Timer },
  { path: '/archived-cars', title: '归档车辆', icon: FolderOpened },
  { path: '/users', title: '用户管理', icon: User },
  { path: '/orders', title: '订单管理', icon: List },
  { path: '/payments', title: '支付管理', icon: Wallet },
]

const activeMenu = computed(() => {
  const path = route.path
  // 处理子路由
  if (path.startsWith('/cars/')) return '/cars'
  return path
})

function toggleCollapse() {
  isCollapse.value = !isCollapse.value
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    userStore.logout()
    router.push('/login')
  } catch {
    // 取消
  }
}
</script>

<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo">
        <img src="/vite.svg" alt="Logo" class="logo-img" />
        <span v-show="!isCollapse" class="logo-text">爱车出海管理后台</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        class="layout-menu"
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>{{ item.title }}</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <Expand v-if="isCollapse" />
            <Fold v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :size="32" :icon="User" />
              <span class="username">{{ userStore.user?.nickname }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.layout-container {
  height: 100vh;
}

.layout-aside {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background-color: #002140;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  margin-left: 12px;
  white-space: nowrap;
}

.layout-menu {
  border-right: none;
  background-color: #001529;
}

.layout-menu:not(.el-menu--collapse) {
  width: 220px;
}

:deep(.el-menu) {
  background-color: #001529;
}

:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.65);
}

:deep(.el-menu-item:hover) {
  background-color: #000c17;
}

:deep(.el-menu-item.is-active) {
  color: #fff;
  background-color: #1890ff;
}

.layout-header {
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.collapse-btn:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  color: #333;
}

.layout-main {
  background-color: #f0f2f5;
  padding: 24px;
  overflow-y: auto;
}
</style>
