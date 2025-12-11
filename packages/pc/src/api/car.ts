import { get, post, put, del, patch } from './request'
import type { CarListItem, CarDetail, PageParams, PageResult, VinValidationResult } from '@/types'

interface FetchCarsParams extends PageParams {
    keyword?: string
    brandId?: number
    priceMin?: number
    priceMax?: number
    mileageMin?: number
    mileageMax?: number
    yearMin?: number
    yearMax?: number
    provinceCode?: string
    cityCode?: string
    districtCode?: string
}

// 获取车源列表
export function getCars(params: FetchCarsParams): Promise<PageResult<CarListItem>> {
    return get('/cars', { params })
}

// 获取车源详情
export function getCarDetail(id: number): Promise<CarDetail> {
    return get(`/cars/${id}`)
}

// 获取我的车源
export function getMyCars(params: PageParams): Promise<PageResult<CarListItem>> {
    return get('/cars/my', { params })
}

// 创建车源
export function createCar(data: any): Promise<CarDetail> {
    return post('/cars', data)
}

// 更新车源
export function updateCar(id: number, data: any): Promise<CarDetail> {
    return put(`/cars/${id}`, data)
}

// 删除车源
export function deleteCar(id: number): Promise<void> {
    return del(`/cars/${id}`)
}

// 切换车源状态
export function toggleCarStatus(id: number, status: 'on' | 'off'): Promise<void> {
    return patch(`/cars/${id}/status`, { status })
}

// 续期车源
export function renewCar(id: number): Promise<void> {
    return post(`/cars/${id}/renew`)
}

// 验证 VIN
export function validateVin(vin: string): Promise<VinValidationResult> {
    return get('/cars/validate-vin', { params: { vin } })
}
