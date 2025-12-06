<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  // 恢复用户会话
  userStore.restoreSession()
})
</script>

<template>
  <router-view />
</template>

<style>
#app {
  min-height: 100vh;
}
</style>
