<script setup lang="ts">
import { onMounted, ref } from 'vue';

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

// 加载省份（使用静态数据）
function loadProvinces() {
    options.value = Object.entries(LOCATION_DATA).map(([code, data]) => ({
        value: code,
        label: data.name,
        leaf: false,
    }))
}

// 懒加载城市和区县
function loadChildren(node: any, resolve: (data: any[]) => void) {
    const { level, value } = node

    if (level === 0) {
        // 加载城市
        const province = LOCATION_DATA[value]
        if (province) {
            const cityOptions = Object.entries(province.cities).map(([code, city]) => ({
                value: code,
                label: city.name,
                leaf: false,
            }))
            resolve(cityOptions)
        } else {
            resolve([])
        }
    } else if (level === 1) {
        // 加载区县
        const parentProvince = Object.values(LOCATION_DATA).find(p => 
            Object.keys(p.cities).includes(value)
        )
        if (parentProvince) {
            const city = parentProvince.cities[value]
            if (city) {
                const districtOptions = city.districts.map((name, index) => ({
                    value: `${value}${String(index + 1).padStart(2, '0')}`,
                    label: name,
                    leaf: true,
                }))
                resolve(districtOptions)
            } else {
                resolve([])
            }
        } else {
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
