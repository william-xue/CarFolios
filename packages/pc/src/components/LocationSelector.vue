<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getProvinces, getCities, getDistricts } from '@/api/location'

defineProps<{
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

const options = ref<CascaderOption[]>([])
const loading = ref(false)

// 加载省份
async function loadProvinces() {
    loading.value = true
    try {
        const provinces = await getProvinces()
        options.value = provinces.map((p) => ({
            value: p.code,
            label: p.name,
            leaf: false,
        }))
    } catch (error) {
        console.error('加载省份失败:', error)
    } finally {
        loading.value = false
    }
}

// 懒加载城市和区县
async function loadChildren(node: any, resolve: (data: any[]) => void) {
    const { level, value } = node

    if (level === 0) {
        // 加载城市
        try {
            const cities = await getCities(value)
            const cityOptions = cities.map((c) => ({
                value: c.code,
                label: c.name,
                leaf: false,
            }))
            resolve(cityOptions)
        } catch (error) {
            console.error('加载城市失败:', error)
            resolve([])
        }
    } else if (level === 1) {
        // 加载区县
        try {
            const districts = await getDistricts(value)
            const districtOptions = districts.map((d) => ({
                value: d.code,
                label: d.name,
                leaf: true,
            }))
            resolve(districtOptions)
        } catch (error) {
            console.error('加载区县失败:', error)
            resolve([])
        }
    } else {
        resolve([])
    }
}

function handleChange(value: any) {
    emit('update:modelValue', value || [])
}

onMounted(() => {
    loadProvinces()
})
</script>

<template>
    <el-cascader
        :model-value="modelValue"
        :options="options"
        :props="{
            lazy: true,
            lazyLoad: loadChildren,
            checkStrictly: true,
        }"
        :placeholder="placeholder || '请选择地区'"
        clearable
        filterable
        style="width: 300px"
        @update:model-value="handleChange"
    />
</template>
