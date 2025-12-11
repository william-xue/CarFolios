<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export interface RangePreset {
  label: string
  min: number | null
  max: number | null
}

interface Props {
  modelValue: [number | null, number | null]
  min: number
  max: number
  step?: number
  unit?: string
  presets?: RangePreset[]
  showInputs?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  step: 1,
  unit: '',
  presets: () => [],
  showInputs: true,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: [number | null, number | null]): void
  (e: 'change', value: [number | null, number | null]): void
}>()

// 内部值
const minValue = ref<number | null>(props.modelValue[0])
const maxValue = ref<number | null>(props.modelValue[1])

// 监听外部值变化
watch(
  () => props.modelValue,
  (newVal) => {
    minValue.value = newVal[0]
    maxValue.value = newVal[1]
  },
  { deep: true }
)

// 检查是否选中某个预设
function isPresetSelected(preset: RangePreset): boolean {
  return minValue.value === preset.min && maxValue.value === preset.max
}

// 选择预设
function selectPreset(preset: RangePreset) {
  minValue.value = preset.min
  maxValue.value = preset.max
  emitChange()
}

// 发出变化事件
function emitChange() {
  const value: [number | null, number | null] = [minValue.value, maxValue.value]
  emit('update:modelValue', value)
  emit('change', value)
}

// 处理最小值变化
function handleMinChange(val: number | undefined) {
  minValue.value = val ?? null
  emitChange()
}

// 处理最大值变化
function handleMaxChange(val: number | undefined) {
  maxValue.value = val ?? null
  emitChange()
}

// 格式化显示值
const displayValue = computed(() => {
  const minStr = minValue.value !== null ? `${minValue.value}${props.unit}` : ''
  const maxStr = maxValue.value !== null ? `${maxValue.value}${props.unit}` : ''
  
  if (minStr && maxStr) {
    return `${minStr} - ${maxStr}`
  } else if (minStr) {
    return `${minStr}以上`
  } else if (maxStr) {
    return `${maxStr}以下`
  }
  return '不限'
})
</script>

<template>
  <div class="range-slider">
    <!-- 预设选项 -->
    <div v-if="presets.length > 0" class="range-presets" role="group" aria-label="快速选择区间">
      <el-tag
        v-for="preset in presets"
        :key="preset.label"
        :type="isPresetSelected(preset) ? 'primary' : 'info'"
        class="preset-tag"
        role="button"
        tabindex="0"
        :aria-pressed="isPresetSelected(preset)"
        @click="selectPreset(preset)"
        @keydown.enter="selectPreset(preset)"
      >
        {{ preset.label }}
      </el-tag>
    </div>

    <!-- 输入框 -->
    <div v-if="showInputs" class="range-inputs">
      <el-input-number
        :model-value="minValue"
        :min="min"
        :max="max"
        :step="step"
        :placeholder="`最小${unit}`"
        controls-position="right"
        @update:model-value="handleMinChange"
      />
      <span class="range-separator">-</span>
      <el-input-number
        :model-value="maxValue"
        :min="min"
        :max="max"
        :step="step"
        :placeholder="`最大${unit}`"
        controls-position="right"
        @update:model-value="handleMaxChange"
      />
      <span v-if="unit" class="range-unit">{{ unit }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.range-slider {
  width: 100%;
}

.range-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.preset-tag {
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:focus {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-separator {
  color: var(--el-text-color-placeholder);
}

.range-unit {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  white-space: nowrap;
}
</style>
