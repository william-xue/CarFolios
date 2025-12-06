import { get } from './request'
import type { Brand, Series } from '@/types'

// 获取品牌列表
export function getBrands(): Promise<Brand[]> {
    return get('/brands')
}

// 获取车系列表
export function getSeries(brandId: number): Promise<Series[]> {
    return get(`/brands/${brandId}/series`)
}
