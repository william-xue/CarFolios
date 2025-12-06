<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="not-found-page">
    <div class="content">
      <h1 class="error-code">404</h1>
      <p class="error-message">抱歉，您访问的页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-color-page;
}

.content {
  text-align: center;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: $primary-color;
  margin-bottom: 16px;
}

.error-message {
  font-size: 18px;
  color: $text-secondary;
  margin-bottom: 32px;
}
</style>
