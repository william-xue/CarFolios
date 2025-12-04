import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Car, CarFilters, Brand, Series, Model, City } from '@/types'
import * as carApi from '@/api/car'

export const useCarStore = defineStore('car', () => {
    const loading = ref(false)
    const cars = ref<Car[]>([])
    const total = ref(0)
    const currentCar = ref<Car | null>(null)

    // 基础数据
    const brands = ref<Brand[]>([])
    const series = ref<Series[]>([])
    const models = ref<Model[]>([])
    const cities = ref<City[]>([])

    // 获取车源列表
    async function fetchCars(filters: CarFilters, page = 1, pageSize = 10) {
        loading.value = true
        try {
            const result = await carApi.getCars({ ...filters, page, pageSize })
            cars.value = result.list
            total.value = result.total
            return result
        } finally {
            loading.value = false
        }
    }

    // 获取待审核车源列表
    async function fetchPendingCars(filters: CarFilters, page = 1, pageSize = 10) {
        loading.value = true
        try {
            const result = await carApi.getPendingCars({ ...filters, page, pageSize })
            cars.value = result.list
            total.value = result.total
            return result
        } finally {
            loading.value = false
        }
    }

    // 获取车源详情
    async function fetchCarDetail(id: number) {
        loading.value = true
        try {
            currentCar.value = await carApi.getCarDetail(id)
            return currentCar.value
        } finally {
            loading.value = false
        }
    }

    // 创建车源
    async function createCar(data: Partial<Car>) {
        loading.value = true
        try {
            return await carApi.createCar(data)
        } finally {
            loading.value = false
        }
    }

    // 更新车源
    async function updateCar(id: number, data: Partial<Car>) {
        loading.value = true
        try {
            return await carApi.updateCar(id, data)
        } finally {
            loading.value = false
        }
    }

    // 审核车源
    async function auditCar(id: number, status: 'approved' | 'rejected', reason?: string) {
        await carApi.auditCar(id, { status, reason })
    }

    // 上架/下架车源
    async function toggleCarStatus(id: number, status: 'on' | 'off') {
        await carApi.toggleCarStatus(id, status)
    }

    // 删除车源
    async function deleteCar(id: number) {
        await carApi.deleteCar(id)
    }

    // 获取品牌列表
    async function fetchBrands() {
        if (brands.value.length === 0) {
            brands.value = await carApi.getBrands()
        }
        return brands.value
    }

    // 获取车系列表
    async function fetchSeries(brandId: number) {
        series.value = await carApi.getSeries(brandId)
        return series.value
    }

    // 获取车型列表（暂时返回空，后端需要添加此接口）
    async function fetchModels(seriesId: number) {
        // TODO: 后端需要添加 /brands/:brandId/series/:seriesId/models 接口
        models.value = []
        return models.value
    }

    // 获取城市列表（暂时返回空，后端需要添加此接口）
    async function fetchCities() {
        // TODO: 后端需要添加 /cities 接口
        cities.value = []
        return cities.value
    }

    return {
        loading,
        cars,
        total,
        currentCar,
        brands,
        series,
        models,
        cities,
        fetchCars,
        fetchPendingCars,
        fetchCarDetail,
        createCar,
        updateCar,
        auditCar,
        toggleCarStatus,
        deleteCar,
        fetchBrands,
        fetchSeries,
        fetchModels,
        fetchCities,
    }
})
