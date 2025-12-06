import { get } from './request'
import type { Province, City, District } from '@/types'

// 获取省份列表
export function getProvinces(): Promise<Province[]> {
    return get('/locations/provinces')
}

// 获取城市列表
export function getCities(provinceCode: string): Promise<City[]> {
    return get(`/locations/provinces/${provinceCode}/cities`)
}

// 获取区县列表
export function getDistricts(cityCode: string): Promise<District[]> {
    return get(`/locations/cities/${cityCode}/districts`)
}
