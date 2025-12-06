<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import LoginModal from '@/components/LoginModal.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useLocale } from '@/composables/useLocale'

const router = useRouter()
const userStore = useUserStore()
const { t } = useLocale()

const showLoginModal = ref(false)
const searchKeyword = ref('')

function handleSearch() {
  if (searchKeyword.value.trim()) {
    router.push({ name: 'Search', query: { keyword: searchKeyword.value } })
  }
}

function goToPublish() {
  if (!userStore.isLoggedIn) {
    showLoginModal.value = true
    return
  }
  router.push('/publish')
}

function goToUserCenter() {
  if (!userStore.isLoggedIn) {
    showLoginModal.value = true
    return
  }
  router.push('/user')
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm(t('message.confirmLogout'), t('common.confirm'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    })
    userStore.logout()
    ElMessage.success(t('message.logoutSuccess'))
    router.push('/')
  } catch {
    // 取消
  }
}

function onLoginSuccess() {
  showLoginModal.value = false
  ElMessage.success(t('message.loginSuccess'))
}
</script>

<template>
  <div class="layout">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <router-link to="/" class="logo">
            <span class="logo-text">CarFolios</span>
          </router-link>
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              :placeholder="t('home.searchPlaceholder')"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
          </div>
        </div>
        <div class="header-right">
          <LanguageSwitcher />
          <el-button type="primary" @click="goToPublish">
            <el-icon><Plus /></el-icon>
            {{ t('nav.publish') }}
          </el-button>
          <template v-if="userStore.isLoggedIn">
            <el-dropdown trigger="click">
              <div class="user-info">
                <el-avatar :src="userStore.user?.avatar" :size="32" />
                <span class="user-name">{{ userStore.user?.nickname }}</span>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="goToUserCenter">
                    <el-icon><User /></el-icon>
                    {{ t('nav.userCenter') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/my-cars')">
                    <el-icon><Document /></el-icon>
                    {{ t('nav.myCars') }}
                  </el-dropdown-item>
                  <el-dropdown-item @click="router.push('/my-orders')">
                    <el-icon><List /></el-icon>
                    {{ t('nav.myOrders') }}
                  </el-dropdown-item>
                  <el-dropdown-item divided @click="handleLogout">
                    <el-icon><SwitchButton /></el-icon>
                    {{ t('nav.logout') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <el-button @click="showLoginModal = true">{{ t('nav.login') }}</el-button>
          </template>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="footer-content">
        <p>© 2025 CarFolios 二手车信息发布平台</p>
      </div>
    </footer>

    <!-- 登录弹窗 -->
    <LoginModal v-model:visible="showLoginModal" @success="onLoginSuccess" />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #fff;
  box-shadow: $box-shadow-sm;
  height: $header-height;
}

.header-content {
  max-width: $content-max-width;
  margin: 0 auto;
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  text-decoration: none;
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: $primary-color;
}

.search-box {
  width: 400px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: $border-radius-sm;

  &:hover {
    background: $bg-color;
  }
}

.user-name {
  font-size: 14px;
  color: $text-primary;
}

.main {
  flex: 1;
  padding: 24px 0;
}

.footer {
  background: #fff;
  border-top: 1px solid $border-color-lighter;
  padding: 20px 0;
}

.footer-content {
  max-width: $content-max-width;
  margin: 0 auto;
  padding: 0 24px;
  text-align: center;
  color: $text-secondary;
  font-size: 14px;
}
</style>
