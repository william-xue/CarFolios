<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'

const { t } = useLocale()

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'success'): void
}>()

const userStore = useUserStore()

const mobile = ref('13800138000')
const code = ref('1234')
const loading = ref(false)
const countdown = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const canSendCode = computed(() => {
  return /^1\d{10}$/.test(mobile.value) && countdown.value === 0
})

const canSubmit = computed(() => {
  // 开发环境支持 4-6 位验证码（兼容万能码 1234）
  return /^1\d{10}$/.test(mobile.value) && /^\d{4,6}$/.test(code.value)
})

async function sendCode() {
  if (!canSendCode.value) return

  try {
    await userStore.sendVerifyCode(mobile.value)
    ElMessage.success(t('message.codeSent'))
    countdown.value = 60
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer!)
        timer = null
      }
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.message || t('message.operationFailed'))
  }
}

async function handleLogin() {
  if (!canSubmit.value) return

  loading.value = true
  try {
    await userStore.login(mobile.value, code.value)
    emit('success')
    resetForm()
  } catch (error: any) {
    ElMessage.error(error.message || t('message.operationFailed'))
  } finally {
    loading.value = false
  }
}

function resetForm() {
  mobile.value = ''
  code.value = ''
  countdown.value = 0
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function handleClose() {
  emit('update:visible', false)
  resetForm()
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="t('auth.loginTitle')"
    width="400px"
    :close-on-click-modal="false"
    aria-labelledby="login-dialog-title"
    @update:model-value="handleClose"
  >
    <template #header>
      <span id="login-dialog-title">{{ t('auth.loginTitle') }}</span>
    </template>
    <el-form @submit.prevent="handleLogin" :aria-label="t('auth.loginTitle')">
      <el-form-item>
        <el-input
          v-model="mobile"
          :placeholder="t('auth.phonePlaceholder')"
          maxlength="11"
          clearable
          :aria-label="t('auth.phone')"
          aria-describedby="mobile-hint"
          autocomplete="tel"
        >
          <template #prefix>
            <el-icon aria-hidden="true"><Iphone /></el-icon>
          </template>
        </el-input>
        <span id="mobile-hint" class="sr-only">{{ t('auth.phonePlaceholder') }}</span>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="code"
          :placeholder="t('auth.codePlaceholder')"
          maxlength="6"
          clearable
          :aria-label="t('auth.verifyCode')"
          aria-describedby="code-hint"
          autocomplete="one-time-code"
        >
          <template #prefix>
            <el-icon aria-hidden="true"><Message /></el-icon>
          </template>
          <template #append>
            <el-button
              :disabled="!canSendCode"
              :aria-label="countdown > 0 ? t('auth.resendCode', { seconds: countdown }) : t('auth.getCode')"
              @click="sendCode"
            >
              {{ countdown > 0 ? `${countdown}s` : t('auth.getCode') }}
            </el-button>
          </template>
        </el-input>
        <span id="code-hint" class="sr-only">{{ t('auth.codePlaceholder') }}</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button :aria-label="t('common.cancel')" @click="handleClose">{{ t('common.cancel') }}</el-button>
      <el-button
        type="primary"
        :loading="loading"
        :disabled="!canSubmit"
        :aria-label="t('auth.loginBtn')"
        @click="handleLogin"
      >
        {{ t('auth.loginBtn') }}
      </el-button>
    </template>
  </el-dialog>
</template>
