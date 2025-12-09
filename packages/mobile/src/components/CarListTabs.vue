<script setup lang="ts">
type TabType = 'recommend' | 'latest' | 'hot'

interface Tab {
  key: TabType
  label: string
}

const props = defineProps<{
  activeTab: TabType
}>()

const emit = defineEmits<{
  (e: 'change', tab: TabType): void
}>()

const tabs: Tab[] = [
  { key: 'recommend', label: '推荐' },
  { key: 'latest', label: '最新' },
  { key: 'hot', label: '热门' }
]

function handleTabClick(tab: TabType) {
  if (tab !== props.activeTab) {
    emit('change', tab)
  }
}
</script>

<template>
  <div class="car-list-tabs">
    <div class="tabs-header">
      <span class="section-title">精选好车</span>
      <div class="tabs-wrapper">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          :class="['tab-item', { active: activeTab === tab.key }]"
          @click="handleTabClick(tab.key)"
        >
          {{ tab.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.car-list-tabs {
  background: #fff;
  padding: 16px 16px 0;
  margin-top: 12px;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.tabs-wrapper {
  display: flex;
  gap: 16px;
}

.tab-item {
  font-size: 13px;
  color: #999;
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item:active {
  opacity: 0.7;
}

.tab-item.active {
  color: #1989fa;
  font-weight: 500;
  border-bottom-color: #1989fa;
}
</style>
