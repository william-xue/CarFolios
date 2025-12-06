<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <span class="language-switcher" role="button" :aria-label="t('language.switch')">
      <el-icon><i-ep-globe /></el-icon>
      <span class="current-lang">{{ localeName }}</span>
      <el-icon class="arrow"><i-ep-arrow-down /></el-icon>
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in locales"
          :key="item.code"
          :command="item.code"
          :class="{ 'is-active': item.code === locale }"
        >
          {{ item.name }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { useLocale } from '@/composables/useLocale'
import type { SupportedLocale } from '@/locales'

const { locale, localeName, locales, setLocale, t } = useLocale()

const emit = defineEmits<{
  (e: 'change', locale: SupportedLocale): void
}>()

function handleCommand(code: SupportedLocale) {
  setLocale(code)
  emit('change', code)
}
</script>

<style scoped lang="scss">
.language-switcher {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  font-size: 14px;
  padding: 6px 12px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: var(--el-color-primary);
    background-color: var(--el-fill-color-light);
  }

  .current-lang {
    margin: 0 4px;
  }

  .arrow {
    font-size: 12px;
  }
}

:deep(.el-dropdown-menu__item) {
  &.is-active {
    color: var(--el-color-primary);
    font-weight: 500;
    background-color: var(--el-color-primary-light-9);
  }
}
</style>
