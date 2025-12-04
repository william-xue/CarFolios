import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Car, CarFilters, PageResult, Brand, Series, Model, City } from '@/types'
import {
    mockGetCars,
    mockGetCarDetail,
    mockCreateCar,
    mockUpdateCar,
    mockUpdateCarStatus,
    mockDeleteCar,
    mockGetBrands,
    mockGetSeries,
    mockGetModels,
    mockGetCities,
} from '@/mock'

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
            const result = await mockGetCars({ ...filters, page, pageSize })
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
            currentCar.value = await mockGetCarDetail(id)
            return currentCar.value
        } finally {
            loading.value = false
        }
    }

    // 创建车源
    async function createCar(data: Partial<Car>) {
        loading.value = true
        try {
            const car = await mockCreateCar(data)
            return car
        } finally {
            loading.value = false
        }
    }

    // 更新车源
    async function updateCar(id: number, data: Partial<Car>) {
        loading.value = true
        try {
            const car = await mockUpdateCar(id, data)
            return car
        } finally {
            loading.value = false
        }
    }

    // 更新车源状态
    async function updateCarStatus(id: number, status: Car['status'], reason?: string) {
        await mockUpdateCarStatus(id, status, reason)
    }

    // 删除车源
    async function deleteCar(id: number) {
        await mockDeleteCar(id)
    }

    // 获取品牌列表
    async function fetchBrands() {
        if (brands.value.length === 0) {
            brands.value = await mockGetBrands()
        }
        return brands.value
    }

    // 获取车系列表
    async function fetchSeries(brandId: number) {
        series.value = await mockGetSeries(brandId)
        return series.value
    }

    // 获取车型列表
    async function fetchModels(seriesId: number) {
        models.value = await mockGetModels(seriesId)
        return models.value
    }

    // 获取城市列表
    async function fetchCities() {
        if (cities.value.length === 0) {
            cities.value = await mockGetCities()
        }
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
        fetchCarDetail,
        createCar,
        updateCar,
        updateCarStatus,
        deleteCar,
        fetchBrands,
        fetchSeries,
        fetchModels,
        fetchCities,
    }
})
