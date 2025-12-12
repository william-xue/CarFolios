// API 响应基础结构
export interface ApiResponse<T> {
    code: number
    message: string
    data: T
}

// 分页响应
export interface PaginatedResponse<T> {
    list: T[]
    total: number
    page: number
    pageSize: number
}

// 车源
export interface Car {
    id: number
    title: string
    price: number
    originalPrice?: number
    coverImage: string
    images: string[]
    firstRegDate: string
    registrationDate?: string
    year?: number
    mileage: number
    gearbox: string
    transmission?: string
    fuelType?: string
    cityName: string
    cityCode: string
    location?: string
    brandId: number
    seriesId: number
    brand?: Brand
    series?: string
    highlightDesc?: string
    highlights?: string[]
    configs?: string[]
    description?: string
    status: string
    displacement?: string
    emissionStandard?: string
    color?: string
    ownerId: number
    owner?: {
        id: number
        nickname?: string
        phone?: string
        avatar?: string
        verified?: boolean
    }
}

// 品牌
export interface Brand {
    id: number
    name: string
    logo: string
    initial: string
}

// 车系
export interface Series {
    id: number
    name: string
    brandId: number
}

// 用户
export interface User {
    id: number
    mobile: string
    nickname: string
    avatar?: string
    authStatus: string
    realName?: string
}

// 地区
export interface Region {
    id: number
    name: string
    parentId: number | null
    level: number
    pinyin?: string
}

// 订单
export interface Order {
    id: number
    orderNo: string
    carId: number
    carTitle: string
    carImage: string
    carPrice: number
    depositAmount: number
    status: string
    buyerId: number
    sellerId: number
    createdAt: string
    payTime?: string
}

// 车源查询参数
export interface CarQueryParams {
    page?: number
    pageSize?: number
    keyword?: string
    brandId?: number
    seriesId?: number
    minPrice?: number
    maxPrice?: number
    minMileage?: number
    maxMileage?: number
    provinceId?: number
    cityId?: number
    sortBy?: 'latest' | 'price_asc' | 'price_desc' | 'mileage'
}

// 地区选择结果
export interface RegionSelection {
    provinceId?: number
    provinceName?: string
    cityId?: number
    cityName?: string
    districtId?: number
    districtName?: string
}

// 登录参数
export interface LoginParams {
    mobile: string
    code: string
}

// 发布车辆参数
export interface PublishCarParams {
    title: string
    brandId: number
    seriesId: number
    firstRegDate: string
    mileage: number
    price: number
    cityCode: string
    cityName: string
    images: string[]
    highlightDesc?: string
    configs?: string[]
    gearbox?: string
    displacement?: number
    color?: string
}
