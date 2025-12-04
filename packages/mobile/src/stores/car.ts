import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CarListItem, CarDetail, Brand } from '@/types'
import * as carApi from '@/api/car'

export const useCarStore = defineStore('car', () => {
    const carList = ref<CarListItem[]>([])
    const currentCar = ref<CarDetail | null>(null)
    const recommendCars = ref<CarListItem[]>([])
    const brands = ref<Brand[]>([])
    const series = ref<{ id: number; brandId: number; name: string }[]>([])
    const total = ref(0)
    const loading = ref(false)

    async function fetchCarList(params: { page: number; pageSize: number; keyword?: string; brandId?: number }) {
        loading.value = true
        try {
            const res = await carApi.getOnSaleCars(params)
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
            currentCar.value = await carApi.getCarDetail(id)
            return currentCar.value
        } finally {
            loading.value = false
        }
    }

    async function fetchRecommendCars() {
        const res = await carApi.getOnSaleCars({ page: 1, pageSize: 4 })
        recommendCars.value = res.list
    }

    async function fetchBrands() {
        brands.value = await carApi.getBrands()
    }

    async function fetchSeries(brandId: number) {
        series.value = await carApi.getSeries(brandId)
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
        total,
        loading,
        fetchCarList,
        fetchCars,
        fetchCarDetail,
        fetchRecommendCars,
        fetchBrands,
        fetchSeries,
    }
})
