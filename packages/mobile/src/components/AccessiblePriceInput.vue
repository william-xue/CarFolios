<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue?: number | string | null
  label?: string
  placeholder?: string
  helpText?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '售价',
  placeholder: '请输入售价',
  helpText: '请输入车辆的售价，单位为万元',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number | string]
}>()

// 生成唯一ID
const inputId = ref(`price-input-${Math.random().toString(36).substr(2, 9)}`)
const helpId = ref(`price-help-${Math.random().toString(36).substr(2, 9)}`)

const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (val) => emit('update:modelValue', val)
})

// 无障碍标签
const ariaLabel = computed(() => `${props.label}，单位为万元`)

function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  inputValue.value = value
}
</script>

<template>
  <van-field
    :id="inputId"
    :model-value="inputValue"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    :required="required"
    type="number"
    :aria-label="ariaLabel"
    :aria-describedby="helpId"
    @input="handleInput"
  >
    <!-- 货币符号前缀 -->
    <template #label>
      <span class="price-label">
        <span class="currency-symbol" aria-hidden="true">¥</span>
        {{ label }}
      </span>
    </template>
    
    <!-- 单位后缀 -->
    <template #button>
      <span class="unit-text" aria-hidden="true">万</span>
    </template>
    
    <!-- 帮助文字 -->
    <template #extra>
      <div :id="helpId" class="help-text">
        {{ helpText }}
      </div>
    </template>
  </van-field>
</template>

<style scoped>
.price-label {
  display: flex;
  align-items: center;
  gap: 4px;
}

.currency-symbol {
  color: #ee0a24;
  font-weight: 600;
  font-size: 16px;
}

.unit-text {
  color: #666;
  font-size: 14px;
}

.help-text {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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
