import request from './request'
import type { CarListItem, CarDetail, Brand, Series, PageResult } from '@/types'

export interface CarListParams {
    page?: number
    pageSize?: number
    keyword?: string
    brandId?: number
    seriesId?: number
    minPrice?: number
    maxPrice?: number
    status?: string
}

// 获取上架车源列表（首页/搜索）
export function getOnSaleCars(params: CarListParams): Promise<PageResult<CarListItem>> {
    return request.get('/cars/on-sale', { params })
}

// 获取车源详情
export function getCarDetail(id: number): Promise<CarDetail> {
    return request.get(`/cars/${id}`)
}

// 获取我的车源
export function getMyCars(params: CarListParams): Promise<PageResult<CarListItem>> {
    return request.get('/cars/my', { params })
}

// 发布车源
export function createCar(data: any) {
    return request.post('/cars', data)
}

// 更新车源
export function updateCar(id: number, data: any) {
    return request.patch(`/cars/${id}`, data)
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
export function getSeries(brandId: number): Promise<Series[]> {
    return request.get(`/brands/${brandId}/series`)
}
