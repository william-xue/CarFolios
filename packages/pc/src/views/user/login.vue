<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const mobile = ref('')
const code = ref('')
const loading = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const canSendCode = computed(() => {
  return /^1\d{10}$/.test(mobile.value) && countdown.value === 0
})

const canSubmit = computed(() => {
  return /^1\d{10}$/.test(mobile.value) && /^\d{6}$/.test(code.value)
})

async function sendCode() {
  if (!canSendCode.value) return

  try {
    await userStore.sendVerifyCode(mobile.value)
    ElMessage.success('验证码已发送')
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer!)
        timer = null
      }
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.message || '发送失败')
  }
}

async function handleLogin() {
  if (!canSubmit.value) return

  loading.value = true
  try {
    await userStore.login(mobile.value, code.value)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch (error: any) {
    ElMessage.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">登录 CarFolios</h1>
      <p class="login-subtitle">二手车信息发布平台</p>

      <el-form class="login-form" @submit.prevent="handleLogin">
        <el-form-item>
          <el-input
            v-model="mobile"
            placeholder="请输入手机号"
            maxlength="11"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Iphone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="code"
            placeholder="请输入验证码"
            maxlength="6"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
            <template #append>
              <el-button :disabled="!canSendCode" @click="sendCode">
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            :disabled="!canSubmit"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <router-link to="/">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
  background: #fff;
  border-radius: $border-radius-lg;
  padding: 40px;
  box-shadow: $box-shadow-lg;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 8px;
}

.login-subtitle {
  text-align: center;
  color: $text-secondary;
  margin-bottom: 32px;
}

.login-form {
  margin-bottom: 24px;
}

.login-footer {
  text-align: center;
}
</style>
