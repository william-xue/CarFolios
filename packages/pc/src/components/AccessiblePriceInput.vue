<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: number | string | null
  label?: string
  placeholder?: string
  helpText?: string
  disabled?: boolean
  required?: boolean
  min?: number
  max?: number
  precision?: number
}

const props = withDefaults(defineProps<Props>(), {
  label: '售价',
  placeholder: '请输入售价',
  helpText: '请输入车辆的售价，单位为万元',
  disabled: false,
  required: false,
  min: 0,
  max: 99999999,
  precision: 2
})

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

// 生成唯一ID
const inputId = ref(`price-input-${Math.random().toString(36).substr(2, 9)}`)
const helpId = ref(`price-help-${Math.random().toString(36).substr(2, 9)}`)

const inputValue = computed({
  get: () => {
    const val = props.modelValue
    if (val === null || val === undefined || val === '') return null
    return typeof val === 'string' ? parseFloat(val) : val
  },
  set: (val) => emit('update:modelValue', val)
})

// 无障碍标签
const ariaLabel = computed(() => `${props.label}，单位为万元`)
</script>

<template>
  <el-form-item :label="label" :required="required">
    <div class="price-input-wrapper">
      <span class="currency-symbol" aria-hidden="true">¥</span>
      <el-input-number
        :id="inputId"
        v-model="inputValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :min="min"
        :max="max"
        :precision="precision"
        :controls="false"
        :aria-label="ariaLabel"
        :aria-describedby="helpId"
        class="price-input"
      />
      <span class="unit-text" aria-hidden="true">万</span>
    </div>
    <div :id="helpId" class="help-text">
      {{ helpText }}
    </div>
  </el-form-item>
</template>

<style scoped>
.price-input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.currency-symbol {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.price-input {
  flex: 1;
}

.price-input :deep(.el-input__inner) {
  text-align: left;
}

.unit-text {
  color: #666;
  font-size: 14px;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

/* 屏幕阅读器专用样式 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
