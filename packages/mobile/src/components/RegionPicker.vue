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
    (e: 'confirm', value: { ids: number[]; names: string[] }): void
}>()

const provinces = ref<Region[]>([])
const cities = ref<Region[]>([])
const districts = ref<Region[]>([])
const loading = ref(false)

const selectedProvince = ref<number | null>(null)
const selectedCity = ref<number | null>(null)
const selectedDistrict = ref<number | null>(null)

// 计算 Picker 的列数据
const columns = computed(() => {
    const cols: any[] = []

    // 省份列
    cols.push({
        values: provinces.value.map((p) => ({ text: p.name, id: p.id })),
        defaultIndex: provinces.value.findIndex((p) => p.id === selectedProvince.value),
    })

    // 城市列
    if (cities.value.length > 0) {
        cols.push({
            values: cities.value.map((c) => ({ text: c.name, id: c.id })),
            defaultIndex: cities.value.findIndex((c) => c.id === selectedCity.value),
        })
    }

    // 区县列
    if (districts.value.length > 0) {
        cols.push({
            values: districts.value.map((d) => ({ text: d.name, id: d.id })),
            defaultIndex: districts.value.findIndex((d) => d.id === selectedDistrict.value),
        })
    }

    return cols
})

// 加载省份
async function loadProvinces() {
    loading.value = true
    try {
        const res = await getProvinces()
        provinces.value = res
    } catch (error) {
        console.error('加载省份失败:', error)
    } finally {
        loading.value = false
    }
}

// 加载城市
async function loadCities(provinceId: number) {
    try {
        const res = await getCities(provinceId)
        cities.value = res
        districts.value = []
        selectedCity.value = null
        selectedDistrict.value = null
    } catch (error) {
        console.error('加载城市失败:', error)
    }
}

// 加载区县
async function loadDistricts(cityId: number) {
    try {
        const res = await getDistricts(cityId)
        districts.value = res
        selectedDistrict.value = null
    } catch (error) {
        console.error('加载区县失败:', error)
    }
}

// 处理列变化
function onChange({ selectedOptions }: any) {
    const [province, city] = selectedOptions

    if (province && province.id !== selectedProvince.value) {
        selectedProvince.value = province.id
        loadCities(province.id)
    }

    if (city && city.id !== selectedCity.value) {
        selectedCity.value = city.id
        loadDistricts(city.id)
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

    emit('update:modelValue', ids)
    emit('confirm', { ids, names })
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
    (val) => {
        if (val && val.length > 0) {
            selectedProvince.value = val[0] || null
            selectedCity.value = val[1] || null
            selectedDistrict.value = val[2] || null
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
            :loading="loading"
            @confirm="onConfirm"
            @cancel="onCancel"
            @change="onChange"
        />
    </van-popup>
</template>
