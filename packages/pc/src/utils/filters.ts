import type { CarListItem } from '@/types'

/**
 * 按关键词筛选车源
 */
export function filterCarsByKeyword(cars: CarListItem[], keyword: string): CarListItem[] {
    if (!keyword || !keyword.trim()) {
        return cars
    }

    const lowerKeyword = keyword.toLowerCase().trim()
    return cars.filter((car) => {
        const searchFields = [car.title, car.brandName, car.seriesName, car.cityName].filter(Boolean)
        return searchFields.some((field) => field?.toLowerCase().includes(lowerKeyword))
    })
}

/**
 * 按品牌筛选车源
 */
export function filterCarsByBrand(cars: CarListItem[], brandId: number | null): CarListItem[] {
    if (!brandId) {
        return cars
    }
    return cars.filter((car) => car.brandId === brandId)
}

/**
 * 按价格区间筛选车源
 */
export function filterCarsByPriceRange(
    cars: CarListItem[],
    priceMin: number | null,
    priceMax: number | null
): CarListItem[] {
    return cars.filter((car) => {
        if (priceMin !== null && car.price < priceMin) {
            return false
        }
        if (priceMax !== null && car.price > priceMax) {
            return false
        }
        return true
    })
}

/**
 * 按地理位置筛选车源
 */
export function filterCarsByLocation(
    cars: CarListItem[],
    provinceCode: string | null,
    cityCode: string | null,
    districtCode: string | null
): CarListItem[] {
    return cars.filter((car) => {
        if (provinceCode && car.provinceCode !== provinceCode) {
            return false
        }
        if (cityCode && car.cityCode !== cityCode) {
            return false
        }
        if (districtCode && car.districtCode !== districtCode) {
            return false
        }
        return true
    })
}

/**
 * 组合筛选条件（AND 逻辑）
 */
export interface FilterParams {
    keyword?: string
    brandId?: number | null
    priceMin?: number | null
    priceMax?: number | null
    provinceCode?: string | null
    cityCode?: string | null
    districtCode?: string | null
}

export function combineFilters(cars: CarListItem[], params: FilterParams): CarListItem[] {
    let result = [...cars]

    if (params.keyword) {
        result = filterCarsByKeyword(result, params.keyword)
    }

    if (params.brandId) {
        result = filterCarsByBrand(result, params.brandId)
    }

    if (params.priceMin !== undefined || params.priceMax !== undefined) {
        result = filterCarsByPriceRange(result, params.priceMin ?? null, params.priceMax ?? null)
    }

    if (params.provinceCode || params.cityCode || params.districtCode) {
        result = filterCarsByLocation(
            result,
            params.provinceCode ?? null,
            params.cityCode ?? null,
            params.districtCode ?? null
        )
    }

    return result
}
