import { get } from './request'
import type { Brand, Series } from '../types'

// 获取品牌列表
export function getBrands() {
    return get<Brand[]>('/brands')
}

// 获取车系列表
export function getSeries(brandId: number) {
    return get<Series[]>(`/brands/${brandId}/series`)
}
