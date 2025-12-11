<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getProvinces, getCities, getDistricts } from '@/api/location'

interface Region {
  id: number
  name: string
  code?: string
}

const props = defineProps<{
  modelValue?: number[]
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
  (e: 'update:show', value: boolean): void
  (e: 'confirm', value: { ids: number[]; names: string[]; fullAddress: string }): void
}>()

const provinces = ref<Region[]>([])
const cities = ref<Region[]>([])
const districts = ref<Region[]>([])
const loading = ref(false)
const loadingCity = ref(false)
const loadingDistrict = ref(false)

const selectedProvince = ref<number | null>(null)
const selectedCity = ref<number | null>(null)
const selectedDistrict = ref<number | null>(null)

// 计算完整地址文本
const fullAddressText = computed(() => {
  const names: string[] = []
  if (selectedProvince.value) {
    const province = provinces.value.find(p => p.id === selectedProvince.value)
    if (province) names.push(province.name)
  }
  if (selectedCity.value) {
    const city = cities.value.find(c => c.id === selectedCity.value)
    if (city) names.push(city.name)
  }
  if (selectedDistrict.value) {
    const district = districts.value.find(d => d.id === selectedDistrict.value)
    if (district) names.push(district.name)
  }
  return names.join(' ')
})

// 计算 Picker 的列数据
const columns = computed(() => {
  const cols: any[] = []

  // 省份列
  cols.push({
    values: provinces.value.map((p) => ({ text: p.name, id: p.id })),
    defaultIndex: Math.max(0, provinces.value.findIndex((p) => p.id === selectedProvince.value)),
  })

  // 城市列
  if (cities.value.length > 0) {
    cols.push({
      values: cities.value.map((c) => ({ text: c.name, id: c.id })),
      defaultIndex: Math.max(0, cities.value.findIndex((c) => c.id === selectedCity.value)),
    })
  }

  // 区县列
  if (districts.value.length > 0) {
    cols.push({
      values: districts.value.map((d) => ({ text: d.name, id: d.id })),
      defaultIndex: Math.max(0, districts.value.findIndex((d) => d.id === selectedDistrict.value)),
    })
  }

  return cols
})

// 是否正在加载
const isLoading = computed(() => loading.value || loadingCity.value || loadingDistrict.value)

// 加载省份
async function loadProvinces() {
  loading.value = true
  try {
    const res = await getProvinces()
    provinces.value = res
    // 如果有初始值，加载对应的城市
    if (selectedProvince.value) {
      await loadCities(selectedProvince.value)
    }
  } catch (error) {
    console.error('加载省份失败:', error)
  } finally {
    loading.value = false
  }
}

// 加载城市
async function loadCities(provinceId: number) {
  loadingCity.value = true
  try {
    const res = await getCities(provinceId)
    cities.value = res
    // 如果没有初始城市值，清空区县
    if (!selectedCity.value || !res.find(c => c.id === selectedCity.value)) {
      districts.value = []
      selectedCity.value = res[0]?.id || null
      selectedDistrict.value = null
    } else if (selectedCity.value) {
      // 有初始城市值，加载区县
      await loadDistricts(selectedCity.value)
    }
  } catch (error) {
    console.error('加载城市失败:', error)
  } finally {
    loadingCity.value = false
  }
}

// 加载区县
async function loadDistricts(cityId: number) {
  loadingDistrict.value = true
  try {
    const res = await getDistricts(cityId)
    districts.value = res
    // 如果没有初始区县值，设置第一个
    if (!selectedDistrict.value || !res.find(d => d.id === selectedDistrict.value)) {
      selectedDistrict.value = res[0]?.id || null
    }
  } catch (error) {
    console.error('加载区县失败:', error)
  } finally {
    loadingDistrict.value = false
  }
}

// 处理列变化
async function onChange({ selectedOptions }: any) {
  const [province, city] = selectedOptions

  if (province && province.id !== selectedProvince.value) {
    selectedProvince.value = province.id
    await loadCities(province.id)
  }

  if (city && city.id !== selectedCity.value) {
    selectedCity.value = city.id
    await loadDistricts(city.id)
  }
}

// 确认选择
function onConfirm({ selectedOptions }: any) {
  const ids: number[] = []
  const names: string[] = []

  selectedOptions.forEach((opt: any) => {
    if (opt) {
      ids.push(opt.id)
      names.push(opt.text)
    }
  })

  const fullAddress = names.join(' ')

  emit('update:modelValue', ids)
  emit('confirm', { ids, names, fullAddress })
  emit('update:show', false)
}

// 取消选择
function onCancel() {
  emit('update:show', false)
}

// 监听显示状态
watch(
  () => props.show,
  (val) => {
    if (val && provinces.value.length === 0) {
      loadProvinces()
    }
  },
  { immediate: true }
)

// 初始化选中值
watch(
  () => props.modelValue,
  async (val) => {
    if (val && val.length > 0) {
      selectedProvince.value = val[0] || null
      selectedCity.value = val[1] || null
      selectedDistrict.value = val[2] || null
      
      // 如果省份已加载且有初始省份值，加载城市
      if (provinces.value.length > 0 && selectedProvince.value) {
        await loadCities(selectedProvince.value)
      }
    }
  },
  { immediate: true }
)
</script>

<template>
  <van-popup :show="show" position="bottom" @update:show="emit('update:show', $event)">
    <van-picker
      title="选择地区"
      :columns="columns"
      :loading="isLoading"
      @confirm="onConfirm"
      @cancel="onCancel"
      @change="onChange"
    />
    <!-- 加载状态指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <van-loading size="24px" color="#1989fa">加载中...</van-loading>
    </div>
    <!-- 完整地址显示 -->
    <div v-if="fullAddressText" class="full-address">
      <span class="label">已选择：</span>
      <span class="text">{{ fullAddressText }}</span>
    </div>
  </van-popup>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.9);
  padding: 16px 24px;
  border-radius: 8px;
  z-index: 10;
}

.full-address {
  padding: 12px 16px;
  background: #f7f8fa;
  border-top: 1px solid #ebedf0;
  font-size: 13px;
}

.full-address .label {
  color: #969799;
}

.full-address .text {
  color: #323233;
  font-weight: 500;
}
</style>
