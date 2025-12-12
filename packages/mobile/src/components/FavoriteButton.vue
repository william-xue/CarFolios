<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { showToast } from 'vant'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { checkFavorite, addFavorite, removeFavorite } from '@/api/favorite'

const props = defineProps<{
  carId: number
  size?: 'small' | 'normal' | 'large'
}>()

const emit = defineEmits<{
  (e: 'change', isFavorited: boolean): void
}>()

const router = useRouter()
const userStore = useUserStore()
const isFavorited = ref(false)
const loading = ref(false)

// 检查收藏状态
async function checkStatus() {
  if (!userStore.isLoggedIn || !props.carId) return
  try {
    const result = await checkFavorite(props.carId)
    isFavorited.value = result.isFavorited
  } catch (e) {
    // 忽略错误
  }
}

// 切换收藏状态
async function toggleFavorite() {
  if (!userStore.isLoggedIn) {
    showToast('请先登录')
    router.push('/login')
    return
  }

  if (loading.value) return
  loading.value = true

  try {
    if (isFavorited.value) {
      await removeFavorite(props.carId)
      isFavorited.value = false
      showToast('已取消收藏')
    } else {
      await addFavorite(props.carId)
      isFavorited.value = true
      showToast('收藏成功')
    }
    emit('change', isFavorited.value)
  } catch (e: any) {
    showToast(e.message || '操作失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkStatus()
})

watch(() => props.carId, () => {
  checkStatus()
})

watch(() => userStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    checkStatus()
  } else {
    isFavorited.value = false
  }
})
</script>

<template>
  <van-icon
    :name="isFavorited ? 'like' : 'like-o'"
    :class="['favorite-btn', { 'is-favorited': isFavorited, 'is-loading': loading }]"
    :size="size === 'large' ? 28 : size === 'small' ? 18 : 22"
    @click.stop="toggleFavorite"
  />
</template>

<style scoped>
.favorite-btn {
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn:active {
  transform: scale(0.9);
}

.favorite-btn.is-favorited {
  color: #ff4d4f;
}

.favorite-btn.is-loading {
  opacity: 0.5;
  pointer-events: none;
}
</style>
