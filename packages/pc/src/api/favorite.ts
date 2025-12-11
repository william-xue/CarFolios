import { get, post, del } from './request'
import type { CarListItem, PageParams, PageResult } from '@/types'

// 收藏项类型
export interface FavoriteItem {
    id: number
    carId: number
    createdAt: string
    car: CarListItem & {
        status: string
    }
}

// 收藏状态检查结果
export interface FavoriteCheckResult {
    isFavorited: boolean
}

// 收藏数量结果
export interface FavoriteCountResult {
    count: number
}

/**
 * 获取收藏列表
 * @param params 分页参数
 * @returns 收藏列表分页结果
 * Requirements: 3.4
 */
export function getFavorites(params: PageParams): Promise<PageResult<FavoriteItem>> {
    return get('/favorites', { params })
}

/**
 * 添加收藏
 * @param carId 车辆ID
 * Requirements: 3.1
 */
export function addFavorite(carId: number): Promise<void> {
    return post(`/favorites/${carId}`)
}

/**
 * 取消收藏
 * @param carId 车辆ID
 * Requirements: 3.2
 */
export function removeFavorite(carId: number): Promise<void> {
    return del(`/favorites/${carId}`)
}

/**
 * 检查是否已收藏
 * @param carId 车辆ID
 * @returns 收藏状态
 * Requirements: 3.6
 */
export function checkFavorite(carId: number): Promise<FavoriteCheckResult> {
    return get(`/favorites/check/${carId}`)
}

/**
 * 获取收藏数量
 * @returns 收藏数量
 */
export function getFavoriteCount(): Promise<FavoriteCountResult> {
    return get('/favorites/count')
}
