import { get } from './request'

export interface Region {
    id: number
    name: string
    parentId: number | null
    level: number
    pinyin?: string
    lat?: number
    lng?: number
}

// 获取省份列表
export function getProvinces(): Promise<Region[]> {
    return get('/regions/provinces')
}

// 获取城市列表
export function getCities(provinceId: number): Promise<Region[]> {
    return get(`/regions/cities/${provinceId}`)
}

// 获取区县列表
export function getDistricts(cityId: number): Promise<Region[]> {
    return get(`/regions/districts/${cityId}`)
}

// 搜索区域
export function searchRegions(keyword: string): Promise<Region[]> {
    return get('/regions/search', { params: { keyword } })
}
