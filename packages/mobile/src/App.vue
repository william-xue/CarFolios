<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 需要显示底部导航的页面
const showTabbar = computed(() => {
  const tabbarRoutes = ['/', '/home', '/publish', '/user']
  return tabbarRoutes.includes(route.path)
})

const active = computed(() => {
  if (route.path === '/' || route.path === '/home') return 0
  if (route.path === '/publish') return 1
  if (route.path === '/user') return 2
  return 0
})
</script>

<template>
  <router-view />
  <van-tabbar v-if="showTabbar" :model-value="active" route>
    <van-tabbar-item to="/home" icon="home-o">首页</van-tabbar-item>
    <van-tabbar-item to="/publish" icon="add-o">发布</van-tabbar-item>
    <van-tabbar-item to="/user" icon="user-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<style scoped>
</style>
