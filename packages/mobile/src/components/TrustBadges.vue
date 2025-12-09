<script setup lang="ts">
interface TrustBadge {
  icon: string
  text: string
}

defineProps<{
  badges: TrustBadge[]
}>()
</script>

<template>
  <div class="trust-badges-section">
    <div class="trust-badges">
      <div
        v-for="(badge, index) in badges"
        :key="index"
        class="trust-badge"
      >
        <van-icon :name="badge.icon" class="badge-icon" />
        <span class="badge-text">{{ badge.text }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trust-badges-section {
  padding: 20px 16px;
  margin-top: 12px;
  margin-bottom: 60px;
}

.trust-badges {
  display: flex;
  justify-content: center;
  gap: 24px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #fff 100%);
  border-radius: 12px;
  border: 1px solid #eee;
}

.trust-badge {
  display: flex;
  align-items: center;
  gap: 6px;
}

.badge-icon {
  font-size: 20px;
  color: #1989fa;
}

.badge-text {
  font-size: 12px;
  color: #333;
  font-weight: 500;
}
</style>
