<script setup lang="ts">
interface FeatureItem {
  icon: string
  title: string
  description: string
  gradient: 'purple' | 'pink' | 'blue' | 'green'
}

defineProps<{
  features: FeatureItem[]
}>()

const gradientClasses: Record<string, string> = {
  purple: 'gradient-purple',
  pink: 'gradient-pink',
  blue: 'gradient-blue',
  green: 'gradient-green'
}
</script>

<template>
  <div class="feature-cards">
    <div
      v-for="(feature, index) in features"
      :key="index"
      class="feature-card"
    >
      <div :class="['feature-icon', gradientClasses[feature.gradient]]">
        <van-icon :name="feature.icon" />
      </div>
      <div class="feature-content">
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-desc">{{ feature.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feature-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
  background: #fff;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:active {
  transform: scale(0.98);
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: #fff;
  flex-shrink: 0;
}

.gradient-purple {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-pink {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.gradient-blue {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.gradient-green {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.feature-content {
  flex: 1;
  min-width: 0;
}

.feature-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.feature-desc {
  font-size: 11px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
