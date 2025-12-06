import request from './request'
import type { Car, PageResult, Brand } from '@/types'

export interface CarListParams {
    page?: number
    pageSize?: number
    keyword?: string
    brandId?: number
    status?: string
    sourceType?: string
    cityCode?: string
}

// 获取车源列表（全部）
export function getCars(params: CarListParams): Promise<PageResult<Car>> {
    return request.get('/cars', { params })
}

// 获取待审核车源列表
export function getPendingCars(params: CarListParams): Promise<PageResult<Car>> {
    return request.get('/cars/pending', { params })
}

// 获取车源详情
export function getCarDetail(id: number): Promise<Car> {
    return request.get(`/cars/${id}`)
}

// 创建车源
export function createCar(data: Partial<Car>): Promise<Car> {
    return request.post('/cars', data)
}

// 更新车源
export function updateCar(id: number, data: Partial<Car>): Promise<Car> {
    return request.patch(`/cars/${id}`, data)
}

// 审核车源
export function auditCar(id: number, data: { status: 'approved' | 'rejected'; reason?: string }) {
    return request.patch(`/cars/${id}/audit`, data)
}

// 上架/下架车源
export function toggleCarStatus(id: number, status: 'on' | 'off') {
    return request.patch(`/cars/${id}/toggle`, { status })
}

// 删除车源
export function deleteCar(id: number) {
    return request.delete(`/cars/${id}`)
}

// 获取所有品牌
export function getBrands(): Promise<Brand[]> {
    return request.get('/brands')
}

// 获取品牌下的车系
export function getSeries(brandId: number) {
    return request.get(`/brands/${brandId}/series`)
}

// 续期车源
export function renewCar(id: number) {
    return request.post(`/cars/${id}/renew`)
}

// 获取归档车辆列表
export function getArchivedCars(params: { page?: number; pageSize?: number }): Promise<PageResult<any>> {
    return request.get('/cars/archived', { params })
}

// 恢复归档车辆
export function restoreArchivedCar(id: number) {
    return request.post(`/cars/archived/${id}/restore`)
}

// 永久删除归档车辆
export function deleteArchivedCar(id: number) {
    return request.delete(`/cars/archived/${id}`)
}
