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

const suggestions = ref<string[]>([])

// 加载历史地址
onMounted(() => {
  suggestions.value = addressMemoryService.getHistory()
})

// 搜索建议
function querySearch(queryString: string, cb: (results: { value: string }[]) => void) {
  const results = queryString
    ? suggestions.value
        .filter(addr => addr.toLowerCase().includes(queryString.toLowerCase()))
        .map(addr => ({ value: addr }))
    : suggestions.value.map(addr => ({ value: addr }))
  cb(results)
}

// 选择地址
function handleSelect(item: { value: string }) {
  inputValue.value = item.value
}

// 输入完成时保存到历史
function handleBlur() {
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
}
</script>

<template>
  <div class="address-input-wrapper">
    <el-autocomplete
      v-model="inputValue"
      :fetch-suggestions="querySearch"
      :placeholder="placeholder"
      :disabled="disabled"
      clearable
      style="width: 100%"
      @select="handleSelect"
      @blur="handleBlur"
    >
      <template #default="{ item }">
        <div class="suggestion-item">
          <el-icon class="location-icon"><Location /></el-icon>
          <span class="address-text">{{ item.value }}</span>
        </div>
      </template>
      <template #suffix v-if="suggestions.length > 0">
        <el-tooltip content="清空历史地址" placement="top">
          <el-icon class="clear-history-btn" @click.stop="clearHistory">
            <Delete />
          </el-icon>
        </el-tooltip>
      </template>
    </el-autocomplete>
  </div>
</template>

<script lang="ts">
import { Location, Delete } from '@element-plus/icons-vue'
export default {
  components: { Location, Delete }
}
</script>

<style scoped>
.address-input-wrapper {
  width: 100%;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.location-icon {
  margin-right: 8px;
  color: #999;
}

.address-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-history-btn {
  cursor: pointer;
  color: #999;
  transition: color 0.3s;
}

.clear-history-btn:hover {
  color: #f56c6c;
}
</style>
