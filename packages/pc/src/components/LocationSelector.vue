<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  modelValue?: string[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
  (e: 'change', value: string[], labels: string[]): void
}>()

interface CascaderOption {
  value: string
  label: string
  children?: CascaderOption[]
  leaf?: boolean
}

// 静态省市区数据（主要出口车源城市）
const LOCATION_DATA: Record<string, { name: string; cities: Record<string, { name: string; districts: string[] }> }> = {
  '440000': {
    name: '广东省',
    cities: {
      '440100': { name: '广州市', districts: ['天河区', '海珠区', '越秀区', '白云区', '番禺区'] },
      '440300': { name: '深圳市', districts: ['福田区', '南山区', '罗湖区', '宝安区', '龙岗区'] },
      '440600': { name: '佛山市', districts: ['禅城区', '南海区', '顺德区', '三水区', '高明区'] },
      '441900': { name: '东莞市', districts: ['莞城街道', '南城街道', '东城街道', '万江街道'] },
    }
  },
  '310000': {
    name: '上海市',
    cities: {
      '310100': { name: '上海市', districts: ['浦东新区', '黄浦区', '静安区', '徐汇区', '长宁区', '普陀区'] },
    }
  },
  '110000': {
    name: '北京市',
    cities: {
      '110100': { name: '北京市', districts: ['朝阳区', '海淀区', '东城区', '西城区', '丰台区', '通州区'] },
    }
  },
  '330000': {
    name: '浙江省',
    cities: {
      '330100': { name: '杭州市', districts: ['西湖区', '上城区', '拱墅区', '滨江区', '余杭区'] },
      '330200': { name: '宁波市', districts: ['海曙区', '江北区', '鄞州区', '镇海区', '北仑区'] },
    }
  },
  '320000': {
    name: '江苏省',
    cities: {
      '320100': { name: '南京市', districts: ['玄武区', '秦淮区', '建邺区', '鼓楼区', '浦口区'] },
      '320500': { name: '苏州市', districts: ['姑苏区', '虎丘区', '吴中区', '相城区', '吴江区'] },
    }
  },
  '370000': {
    name: '山东省',
    cities: {
      '370200': { name: '青岛市', districts: ['市南区', '市北区', '黄岛区', '崂山区', '城阳区'] },
      '370100': { name: '济南市', districts: ['历下区', '市中区', '槐荫区', '天桥区', '历城区'] },
    }
  },
  '510000': {
    name: '四川省',
    cities: {
      '510100': { name: '成都市', districts: ['锦江区', '青羊区', '金牛区', '武侯区', '成华区'] },
    }
  },
  '500000': {
    name: '重庆市',
    cities: {
      '500100': { name: '重庆市', districts: ['渝中区', '江北区', '南岸区', '渝北区', '沙坪坝区'] },
    }
  },
}

const options = ref<CascaderOption[]>([])

// 计算完整地址文本
const fullAddressText = computed(() => {
  if (!props.modelValue || props.modelValue.length === 0) return ''
  
  const labels: string[] = []
  const [provinceCode, cityCode, districtCode] = props.modelValue
  
  if (provinceCode && LOCATION_DATA[provinceCode]) {
    labels.push(LOCATION_DATA[provinceCode].name)
    
    if (cityCode) {
      const city = LOCATION_DATA[provinceCode].cities[cityCode]
      if (city) {
        labels.push(city.name)
        
        if (districtCode) {
          // 从 districtCode 解析区县索引
          const districtIndex = parseInt(districtCode.slice(-2)) - 1
          if (city.districts[districtIndex]) {
            labels.push(city.districts[districtIndex])
          }
        }
      }
    }
  }
  
  return labels.join(' ')
})

// 构建完整的级联选项数据（非懒加载模式）
function buildOptions(): CascaderOption[] {
  return Object.entries(LOCATION_DATA).map(([provinceCode, province]) => ({
    value: provinceCode,
    label: province.name,
    children: Object.entries(province.cities).map(([cityCode, city]) => ({
      value: cityCode,
      label: city.name,
      children: city.districts.map((districtName, index) => ({
        value: `${cityCode}${String(index + 1).padStart(2, '0')}`,
        label: districtName,
        leaf: true,
      })),
    })),
  }))
}

function handleChange(value: any) {
  emit('update:modelValue', value || [])
  
  // 获取选中的标签
  if (value && value.length > 0) {
    const labels: string[] = []
    const [provinceCode, cityCode, districtCode] = value
    
    if (provinceCode && LOCATION_DATA[provinceCode]) {
      labels.push(LOCATION_DATA[provinceCode].name)
      
      if (cityCode) {
        const city = LOCATION_DATA[provinceCode].cities[cityCode]
        if (city) {
          labels.push(city.name)
          
          if (districtCode) {
            const districtIndex = parseInt(districtCode.slice(-2)) - 1
            if (city.districts[districtIndex]) {
              labels.push(city.districts[districtIndex])
            }
          }
        }
      }
    }
    
    emit('change', value, labels)
  }
}

onMounted(() => {
  // 直接构建完整的选项数据
  options.value = buildOptions()
})
</script>

<template>
  <div class="location-selector">
    <el-cascader
      ref="cascaderRef"
      :model-value="modelValue"
      :options="options"
      :props="{
        checkStrictly: true,
        expandTrigger: 'hover',
      }"
      :placeholder="placeholder || '请选择地区'"
      clearable
      filterable
      style="width: 300px"
      @update:model-value="handleChange"
    />
    <!-- 完整地址显示 -->
    <div v-if="fullAddressText" class="full-address-display">
      <el-icon><Location /></el-icon>
      <span>{{ fullAddressText }}</span>
    </div>
  </div>
</template>

<style scoped>
.location-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-address-display {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #606266;
  padding: 4px 0;
}

.full-address-display .el-icon {
  color: #409eff;
}
</style>
