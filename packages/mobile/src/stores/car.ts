import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CarListItem, CarDetail, Brand, City } from '@/types'
import { mockGetCarList, mockGetCarDetail, mockGetRecommendCars, mockGetBrands, mockGetSeries, mockGetCities } from '@/mock'

export const useCarStore = defineStore('car', () => {
    const carList = ref<CarListItem[]>([])
    const currentCar = ref<CarDetail | null>(null)
    const recommendCars = ref<CarListItem[]>([])
    const brands = ref<Brand[]>([])
    const series = ref<{ id: number; brandId: number; name: string }[]>([])
    const cities = ref<City[]>([])
    const total = ref(0)
    const loading = ref(false)

    async function fetchCarList(params: { page: number; pageSize: number; keyword?: string; brandId?: number }) {
        loading.value = true
        try {
            const res = await mockGetCarList(params)
            if (params.page === 1) {
                carList.value = res.list
            } else {
                carList.value.push(...res.list)
            }
            total.value = res.total
            return res
        } finally {
            loading.value = false
        }
    }

    async function fetchCarDetail(id: number) {
        loading.value = true
        try {
            currentCar.value = await mockGetCarDetail(id)
            return currentCar.value
        } finally {
            loading.value = false
        }
    }

    async function fetchRecommendCars() {
        recommendCars.value = await mockGetRecommendCars()
    }

    async function fetchBrands() {
        brands.value = await mockGetBrands()
    }

    async function fetchSeries(brandId: number) {
        series.value = await mockGetSeries(brandId)
    }

    async function fetchCities() {
        cities.value = await mockGetCities()
    }

    // 别名，兼容不同命名
    const cars = carList
    const fetchCars = fetchCarList

    return {
        carList,
        cars,
        currentCar,
        recommendCars,
        brands,
        series,
        cities,
        total,
        loading,
        fetchCarList,
        fetchCars,
        fetchCarDetail,
        fetchRecommendCars,
        fetchBrands,
        fetchSeries,
        fetchCities,
    }
})
