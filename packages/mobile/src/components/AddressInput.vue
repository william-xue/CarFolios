<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { addressMemoryService } from '@/services/addressMemory'

interface Props {
  modelValue?: string
  placeholder?: string
  label?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请输入详细地址',
  label: '详细地址',
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputValue = computed({
  get: () => props.modelValue || '',
  set: (val) => emit('update:modelValue', val)
})

const showSuggestions = ref(false)
const suggestions = ref<string[]>([])

// 加载历史地址
onMounted(() => {
  suggestions.value = addressMemoryService.getHistory()
})

// 输入框聚焦时显示建议
function handleFocus() {
  if (suggestions.value.length > 0 && !props.disabled) {
    showSuggestions.value = true
  }
}

// 输入框失焦时隐藏建议（延迟以允许点击选择）
function handleBlur() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// 选择历史地址
function selectAddress(address: string) {
  inputValue.value = address
  showSuggestions.value = false
}

// 输入变化时保存地址
function handleInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  inputValue.value = value
}

// 输入完成时保存到历史
function handleChange() {
  if (inputValue.value && inputValue.value.trim()) {
    addressMemoryService.saveAddress(inputValue.value)
    // 更新建议列表
    suggestions.value = addressMemoryService.getHistory()
  }
}

// 清空历史
function clearHistory() {
  addressMemoryService.clearHistory()
  suggestions.value = []
  showSuggestions.value = false
}
</script>

<template>
  <div class="address-input-wrapper">
    <van-field
      :model-value="inputValue"
      :label="label"
      :placeholder="placeholder"
      :disabled="disabled"
      type="textarea"
      rows="2"
      autosize
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @change="handleChange"
    />
    
    <!-- 历史地址建议列表 -->
    <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown">
      <div class="suggestions-header">
        <span>历史地址</span>
        <span class="clear-btn" @click="clearHistory">清空</span>
      </div>
      <div 
        v-for="(address, index) in suggestions" 
        :key="index"
        class="suggestion-item"
        @click="selectAddress(address)"
      >
        <van-icon name="location-o" class="location-icon" />
        <span class="address-text">{{ address }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.address-input-wrapper {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 12px;
  color: #999;
  border-bottom: 1px solid #f5f5f5;
}

.clear-btn {
  color: #1989fa;
  cursor: pointer;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
}

.suggestion-item:active {
  background: #f5f5f5;
}

.location-icon {
  margin-right: 8px;
  color: #999;
}

.address-text {
  flex: 1;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
