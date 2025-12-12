import { get } from './request'
import type { Region } from '../types'

// 获取省份列表
export function getProvinces() {
    return get<Region[]>('/regions/provinces')
}

// 获取城市列表
export function getCities(provinceId: number) {
    return get<Region[]>(`/regions/cities/${provinceId}`)
}

// 获取区县列表
export function getDistricts(cityId: number) {
    return get<Region[]>(`/regions/districts/${cityId}`)
}
