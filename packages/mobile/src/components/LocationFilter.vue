<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { getProvinces, getCities, type Region } from '@/api/location'

const props = defineProps<{
  visible: boolean
  provinceId?: number
  cityId?: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm', data: { provinceId?: number; provinceName?: string; cityId?: number; cityName?: string }): void
}>()

const provinces = ref<Region[]>([])
const cities = ref<Region[]>([])
const selectedProvinceId = ref<number | undefined>(props.provinceId)
const selectedCityId = ref<number | undefined>(props.cityId)
const loading = ref(false)

// 当前选中的省份
const selectedProvince = computed(() => 
  provinces.value.find(p => p.id === selectedProvinceId.value)
)

// 当前选中的城市
const selectedCity = computed(() => 
  cities.value.find(c => c.id === selectedCityId.value)
)

// 加载省份
async function loadProvinces() {
  loading.value = true
  try {
    provinces.value = await getProvinces()
  } finally {
    loading.value = false
  }
}

// 加载城市
async function loadCities(provinceId: number) {
  loading.value = true
  try {
    cities.value = await getCities(provinceId)
  } finally {
    loading.value = false
  }
}

// 选择省份
function selectProvince(province: Region) {
  selectedProvinceId.value = province.id
  selectedCityId.value = undefined
  loadCities(province.id)
}

// 选择城市
function selectCity(city: Region) {
  selectedCityId.value = city.id
}

// 确认选择
function handleConfirm() {
  emit('confirm', {
    provinceId: selectedProvinceId.value,
    provinceName: selectedProvince.value?.name,
    cityId: selectedCityId.value,
    cityName: selectedCity.value?.name
  })
  emit('update:visible', false)
}

// 重置
function handleReset() {
  selectedProvinceId.value = undefined
  selectedCityId.value = undefined
  cities.value = []
  emit('confirm', {})
  emit('update:visible', false)
}



// 监听显示状态
watch(() => props.visible, (val) => {
  if (val && provinces.value.length === 0) {
    loadProvinces()
  }
})

// 初始化
watch(() => props.provinceId, (val) => {
  selectedProvinceId.value = val
  if (val) {
    loadCities(val)
  }
}, { immediate: true })

watch(() => props.cityId, (val) => {
  selectedCityId.value = val
}, { immediate: true })
</script>

<template>
  <van-popup
    :show="visible"
    position="bottom"
    round
    closeable
    :style="{ height: '70%' }"
    @update:show="$emit('update:visible', $event)"
  >
    <div class="location-filter">
      <div class="filter-header">
        <span class="title">选择位置</span>
      </div>
      
      <div class="filter-content" v-loading="loading">
        <div class="region-columns">
          <!-- 省份列表 -->
          <div class="region-column">
            <div class="column-title">省份</div>
            <div class="region-list">
              <div
                v-for="province in provinces"
                :key="province.id"
                class="region-item"
                :class="{ active: selectedProvinceId === province.id }"
                @click="selectProvince(province)"
              >
                {{ province.name }}
              </div>
            </div>
          </div>
          
          <!-- 城市列表 -->
          <div class="region-column">
            <div class="column-title">城市</div>
            <div class="region-list">
              <div
                v-for="city in cities"
                :key="city.id"
                class="region-item"
                :class="{ active: selectedCityId === city.id }"
                @click="selectCity(city)"
              >
                {{ city.name }}
              </div>
              <div v-if="!selectedProvinceId" class="empty-tip">
                请先选择省份
              </div>
              <div v-else-if="cities.length === 0 && !loading" class="empty-tip">
                暂无城市数据
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="filter-footer">
        <van-button plain @click="handleReset">重置</van-button>
        <van-button type="primary" @click="handleConfirm">确定</van-button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.location-filter {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-header {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #f5f5f5;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.filter-content {
  flex: 1;
  overflow: hidden;
}

.region-columns {
  display: flex;
  height: 100%;
}

.region-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f5f5f5;
}

.region-column:last-child {
  border-right: none;
}

.column-title {
  padding: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  background: #fafafa;
}

.region-list {
  flex: 1;
  overflow-y: auto;
}

.region-item {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
}

.region-item:active {
  background: #f5f5f5;
}

.region-item.active {
  color: #1989fa;
  background: #e8f4ff;
}

.empty-tip {
  padding: 24px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.filter-footer {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid #f5f5f5;
}

.filter-footer .van-button {
  flex: 1;
}
</style>
