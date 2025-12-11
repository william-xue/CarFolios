<script setup lang="ts">
import { addFavorite, checkFavorite, removeFavorite } from '@/api/favorite'
import { useLocale } from '@/composables/useLocale'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { onMounted, ref, watch } from 'vue'

/**
 * 收藏按钮组件
 * Requirements: 3.1, 3.2, 3.3, 3.6
 */

const props = withDefaults(defineProps<{
  carId: number
  isFavorited?: boolean
  size?: 'small' | 'default' | 'large'
  showText?: boolean
}>(), {
  isFavorited: undefined,
  size: 'default',
  showText: false
})

const emit = defineEmits<{
  (e: 'change', isFavorited: boolean): void
  (e: 'login-required'): void
}>()

const { t } = useLocale()
const userStore = useUserStore()

const favorited = ref(false)
const loading = ref(false)

// 图标大小映射
const iconSizeMap = {
  small: 16,
  default: 20,
  large: 24
}

// 初始化收藏状态
onMounted(async () => {
  if (props.isFavorited !== undefined) {
    favorited.value = props.isFavorited
  } else if (userStore.isLoggedIn) {
    await fetchFavoriteStatus()
  }
})

// 监听 carId 变化
watch(() => props.carId, async () => {
  if (userStore.isLoggedIn) {
    await fetchFavoriteStatus()
  }
})

// 监听外部传入的收藏状态
watch(() => props.isFavorited, (val) => {
  if (val !== undefined) {
    favorited.value = val
  }
})

// 获取收藏状态
async function fetchFavoriteStatus() {
  if (!userStore.isLoggedIn) return
  
  try {
    const result = await checkFavorite(props.carId)
    favorited.value = result.isFavorited
  } catch (error) {
    console.error('获取收藏状态失败:', error)
  }
}

// 切换收藏状态
async function toggleFavorite() {
  // 未登录时触发登录事件
  if (!userStore.isLoggedIn) {
    emit('login-required')
    return
  }

  if (loading.value) return

  loading.value = true
  const previousState = favorited.value

  try {
    if (favorited.value) {
      // 取消收藏 - Requirements: 3.2
      await removeFavorite(props.carId)
      favorited.value = false
      ElMessage.success(t('favorite.removeSuccess') || '已取消收藏')
    } else {
      // 添加收藏 - Requirements: 3.1
      await addFavorite(props.carId)
      favorited.value = true
      ElMessage.success(t('favorite.addSuccess') || '收藏成功')
    }
    emit('change', favorited.value)
  } catch (error: any) {
    // 恢复之前的状态
    favorited.value = previousState
    ElMessage.error(error.message || t('message.operationFailed') || '操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-button
    :size="size"
    :loading="loading"
    :class="['favorite-button', { 'is-favorited': favorited }]"
    :aria-label="favorited ? (t('favorite.remove') || '取消收藏') : (t('favorite.add') || '收藏')"
    :aria-pressed="favorited"
    @click.stop="toggleFavorite"
  >
    <el-icon :size="iconSizeMap[size]">
      <svg v-if="favorited" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <!-- 实心心形图标 -->
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <!-- 空心心形图标 -->
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    </el-icon>
    <span v-if="showText" class="favorite-text">
      {{ favorited ? (t('favorite.favorited') || '已收藏') : (t('favorite.add') || '收藏') }}
    </span>
  </el-button>
</template>

<style scoped>
.favorite-button {
  transition: all 0.2s ease;
}

.favorite-button:hover {
  color: var(--el-color-danger);
  border-color: var(--el-color-danger-light-5);
}

.favorite-button.is-favorited {
  color: var(--el-color-danger);
}

.favorite-button.is-favorited:hover {
  color: var(--el-color-danger-dark-2);
}

.favorite-text {
  margin-left: 4px;
}
</style>
