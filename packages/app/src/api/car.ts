import { get, post } from './request'
import type { Car, PaginatedResponse, CarQueryParams, PublishCarParams } from '../types'

// 获取车源列表
export function getCars(params: CarQueryParams) {
    return get<PaginatedResponse<Car>>('/cars', params)
}

// 获取车源详情
export function getCarDetail(id: number) {
    return get<Car>(`/cars/${id}`)
}

// 发布车源
export function publishCar(params: PublishCarParams) {
    return post<Car>('/cars', params)
}

// 获取我的车源
export function getMyCars(params: { page?: number; pageSize?: number; status?: string }) {
    return get<PaginatedResponse<Car>>('/cars/my', params)
}

// 收藏车源
export function favoriteCar(carId: number) {
    return post<{ success: boolean }>(`/cars/${carId}/favorite`)
}

// 取消收藏
export function unfavoriteCar(carId: number) {
    return post<{ success: boolean }>(`/cars/${carId}/unfavorite`)
}

// 获取收藏列表
export function getFavorites(params: { page?: number; pageSize?: number }) {
    return get<PaginatedResponse<Car>>('/cars/favorites', params)
}
