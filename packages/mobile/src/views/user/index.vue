<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showConfirmDialog, showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

function goToLogin() {
  router.push('/login')
}

function goToMyCars() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  router.push('/my-cars')
}

function goToMyOrders() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }
  router.push('/my-orders')
}

async function handleLogout() {
  try {
    await showConfirmDialog({
      title: '提示',
      message: '确定要退出登录吗？',
    })
    userStore.logout()
    showToast('已退出登录')
  } catch {
    // 取消
  }
}
</script>

<template>
  <div class="user-page">
    <van-nav-bar title="我的" />

    <!-- 用户信息 -->
    <div class="user-header" @click="!userStore.isLoggedIn && goToLogin()">
      <template v-if="userStore.isLoggedIn">
        <van-image :src="userStore.user?.avatar" round width="60" height="60" />
        <div class="user-info">
          <div class="nickname">{{ userStore.user?.nickname }}</div>
          <div class="mobile">{{ userStore.user?.mobile }}</div>
        </div>
      </template>
      <template v-else>
        <van-image src="https://api.dicebear.com/7.x/avataaars/svg?seed=guest" round width="60" height="60" />
        <div class="user-info">
          <div class="nickname">点击登录</div>
          <div class="mobile">登录后享受更多服务</div>
        </div>
      </template>
      <van-icon name="arrow" />
    </div>

    <!-- 功能菜单 -->
    <van-cell-group inset class="menu-group">
      <van-cell title="我的车源" icon="records" is-link @click="goToMyCars" />
      <van-cell title="我的订单" icon="orders-o" is-link @click="goToMyOrders" />
      <van-cell title="我的收藏" icon="star-o" is-link />
      <van-cell title="浏览记录" icon="clock-o" is-link />
    </van-cell-group>

    <van-cell-group inset class="menu-group">
      <van-cell title="实名认证" icon="certificate" is-link>
        <template #value>
          <van-tag v-if="userStore.user?.authStatus === 'verified'" type="success">已认证</van-tag>
          <van-tag v-else-if="userStore.user?.authStatus === 'pending'" type="warning">审核中</van-tag>
          <span v-else>未认证</span>
        </template>
      </van-cell>
      <van-cell title="账户余额" icon="balance-o" is-link>
        <template #value>
          ¥{{ userStore.user?.balance?.toLocaleString() || 0 }}
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group inset class="menu-group">
      <van-cell title="帮助中心" icon="question-o" is-link />
      <van-cell title="意见反馈" icon="comment-o" is-link />
      <van-cell title="关于我们" icon="info-o" is-link />
    </van-cell-group>

    <div v-if="userStore.isLoggedIn" class="logout-btn">
      <van-button block @click="handleLogout">退出登录</van-button>
    </div>
  </div>
</template>

<style scoped>
.user-page {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 80px;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 16px;
  background: linear-gradient(135deg, #1989fa 0%, #0d6efd 100%);
  color: #fff;
}

.user-info {
  flex: 1;
}

.nickname {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.mobile {
  font-size: 14px;
  opacity: 0.8;
}

.menu-group {
  margin-top: 12px;
}

.logout-btn {
  padding: 16px;
  margin-top: 24px;
}
</style>
