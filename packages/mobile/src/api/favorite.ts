import request from './request'
import type { CarListItem } from '@/types'

// 收藏项类型
export interface FavoriteItem {
    id: number
    carId: number
    createdAt: string
    car: CarListItem
}

// 收藏状态检查结果
export interface FavoriteCheckResult {
    isFavorited: boolean
}

// 分页参数
export interface PageParams {
    page?: number
    pageSize?: number
}

// 分页结果
export interface PageResult<T> {
    list: T[]
    total: number
    page: number
    pageSize: number
}

/**
 * 获取收藏列表
 */
export function getFavorites(params: PageParams): Promise<PageResult<FavoriteItem>> {
    return request.get('/favorites', { params })
}

/**
 * 添加收藏
 */
export function addFavorite(carId: number): Promise<void> {
    return request.post(`/favorites/${carId}`)
}

/**
 * 取消收藏
 */
export function removeFavorite(carId: number): Promise<void> {
    return request.delete(`/favorites/${carId}`)
}

/**
 * 检查是否已收藏
 */
export function checkFavorite(carId: number): Promise<FavoriteCheckResult> {
    return request.get(`/favorites/check/${carId}`)
}
