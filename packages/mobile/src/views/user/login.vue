<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const mobile = ref('13800138000')
const code = ref('1234')
const loading = ref(false)
const countdown = ref(0)

async function sendCode() {
  if (!mobile.value || mobile.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  
  try {
    await userStore.sendCode(mobile.value)
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
    showToast('验证码已发送（测试验证码：1234）')
  } catch (error: any) {
    showToast(error.message || '发送失败')
  }
}

async function handleLogin() {
  if (!mobile.value || mobile.value.length !== 11) {
    showToast('请输入正确的手机号')
    return
  }
  if (!code.value) {
    showToast('请输入验证码')
    return
  }

  loading.value = true
  try {
    await userStore.login(mobile.value, code.value)
    showToast('登录成功')
    router.back()
  } catch (error: any) {
    showToast(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.back()
}
</script>

<template>
  <div class="login-page">
    <van-nav-bar title="登录" left-arrow @click-left="goBack" />

    <div class="login-header">
      <h2>欢迎来到车故</h2>
      <p>登录后享受更多服务</p>
    </div>

    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="mobile"
          type="tel"
          label="手机号"
          placeholder="请输入手机号"
          maxlength="11"
        />
        <van-field
          v-model="code"
          type="digit"
          label="验证码"
          placeholder="请输入验证码"
          maxlength="6"
        >
          <template #button>
            <van-button
              size="small"
              type="primary"
              :disabled="countdown > 0"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </van-button>
          </template>
        </van-field>
      </van-cell-group>

      <div class="login-btn">
        <van-button
          type="primary"
          block
          native-type="submit"
          :loading="loading"
        >
          登录
        </van-button>
      </div>
    </van-form>

    <div class="login-tips">
      <p>测试账号：任意11位手机号</p>
      <p>测试验证码：1234</p>
    </div>

    <div class="login-agreement">
      登录即表示同意
      <a href="#">《用户协议》</a>
      和
      <a href="#">《隐私政策》</a>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  background: #fff;
}

.login-header {
  padding: 40px 24px;
  text-align: center;
}

.login-header h2 {
  font-size: 24px;
  margin-bottom: 8px;
}

.login-header p {
  color: #999;
}

.login-btn {
  padding: 24px 16px;
}

.login-tips {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 0 16px;
}

.login-tips p {
  margin-bottom: 4px;
}

.login-agreement {
  position: fixed;
  bottom: 24px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  color: #999;
}

.login-agreement a {
  color: #1989fa;
}
</style>
