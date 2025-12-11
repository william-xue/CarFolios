import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CarListItem, CarDetail, Brand, Series, PageParams, PageResult } from '@/types'
import {
    getCars,
    getCarDetail,
    getMyCars,
    createCar as createCarApi,
    updateCar as updateCarApi,
    deleteCar as deleteCarApi,
    toggleCarStatus as toggleStatusApi,
    renewCar as renewCarApi,
    validateVin as validateVinApi,
} from '@/api/car'
import { getBrands, getSeries } from '@/api/brand'

interface FetchCarsParams extends PageParams {
    keyword?: string
    brandId?: number
    priceMin?: number
    priceMax?: number
    provinceCode?: string
    cityCode?: string
    districtCode?: string
}

export const useCarStore = defineStore('car', () => {
    const cars = ref<CarListItem[]>([])
    const currentCar = ref<CarDetail | null>(null)
    const brands = ref<Brand[]>([])
    const series = ref<Series[]>([])
    const loading = ref(false)
    const total = ref(0)

    // 获取车源列表
    async function fetchCars(params: FetchCarsParams): Promise<PageResult<CarListItem>> {
        loading.value = true
        try {
            const res = await getCars(params)
            if (params.page === 1) {
                cars.value = res.list
            } else {
                cars.value = [...cars.value, ...res.list]
            }
            total.value = res.total
            return res
        } finally {
            loading.value = false
        }
    }

    // 获取车源详情
    async function fetchCarDetail(id: number): Promise<CarDetail> {
        loading.value = true
        try {
            const res = await getCarDetail(id)
            currentCar.value = res
            return res
        } finally {
            loading.value = false
        }
    }

    // 获取品牌列表
    async function fetchBrands(): Promise<Brand[]> {
        const res = await getBrands()
        brands.value = res
        return res
    }

    // 获取车系列表
    async function fetchSeries(brandId: number): Promise<Series[]> {
        const res = await getSeries(brandId)
        series.value = res
        return res
    }

    // 获取我的车源
    async function fetchMyCars(params: PageParams): Promise<PageResult<CarListItem>> {
        loading.value = true
        try {
            const res = await getMyCars(params)
            if (params.page === 1) {
                cars.value = res.list
            } else {
                cars.value = [...cars.value, ...res.list]
            }
            total.value = res.total
            return res
        } finally {
            loading.value = false
        }
    }

    // 创建车源
    async function createCar(data: any) {
        return createCarApi(data)
    }

    // 更新车源
    async function updateCar(id: number, data: any) {
        return updateCarApi(id, data)
    }

    // 删除车源
    async function deleteCar(id: number) {
        await deleteCarApi(id)
        cars.value = cars.value.filter((c) => c.id !== id)
    }

    // 切换车源状态
    async function toggleCarStatus(id: number, status: 'on' | 'off') {
        await toggleStatusApi(id, status)
        const car = cars.value.find((c) => c.id === id)
        if (car) {
            car.status = status
        }
    }

    // 续期车源
    async function renewCar(id: number) {
        await renewCarApi(id)
    }

    // 验证 VIN
    async function validateVin(vin: string) {
        return validateVinApi(vin)
    }

    // 清空当前车源
    function clearCurrentCar() {
        currentCar.value = null
    }

    return {
        cars,
        currentCar,
        brands,
        series,
        loading,
        total,
        fetchCars,
        fetchCarDetail,
        fetchBrands,
        fetchSeries,
        fetchMyCars,
        createCar,
        updateCar,
        deleteCar,
        toggleCarStatus,
        renewCar,
        validateVin,
        clearCurrentCar,
    }
})
