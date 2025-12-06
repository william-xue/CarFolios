// 车源类型
export type SourceType = 'personal' | 'dealer' | 'platform'
export type GearboxType = 'MT' | 'AT' | 'DCT' | 'CVT'
export type EmissionStandard = '国三' | '国四' | '国五' | '国六'
export type UseType = 'family' | 'business' | 'official'
export type CarStatus = 'draft' | 'pending' | 'approved' | 'on' | 'off' | 'sold' | 'rejected'

export interface Brand {
    id: number
    name: string
    logo: string
    initial: string
}

export interface Series {
    id: number
    brandId: number
    name: string
}

// 地理位置类型
export interface Province {
    code: string
    name: string
}

export interface City {
    code: string
    name: string
    provinceCode: string
}

export interface District {
    code: string
    name: string
    cityCode: string
}

export interface CarListItem {
    id: number
    title: string
    coverImage: string
    price: number
    mileage: number
    firstRegDate: string
    cityName: string
    sourceType: SourceType
    gearbox?: string
    tags?: string[]
    status: string
    expireDate?: string
    brandId?: number
    brandName?: string
    seriesName?: string
    provinceCode?: string
    cityCode?: string
    districtCode?: string
}

export interface CarDetail {
    id: number
    title: string
    ownerId: number
    ownerName?: string
    ownerAvatar?: string
    ownerMobile?: string
    sourceType: SourceType
    brandId: number
    brandName: string
    seriesId: number
    seriesName: string
    firstRegDate?: string
    mileage: number
    displacement?: number
    gearbox?: string
    fuelType?: string
    emissionStandard?: EmissionStandard
    useType?: UseType
    transferCount?: number
    provinceCode?: string
    provinceName?: string
    cityCode?: string
    cityName?: string
    districtCode?: string
    districtName?: string
    address?: string
    price: number
    originalPrice?: number
    vin?: string
    status: string
    coverImage: string
    images?: string[]
    video?: string
    highlightDesc?: string
    description?: string
    color?: string
    plateCity?: string
    configs?: string[]
    expireDate?: string
    createdAt?: string
    updatedAt?: string
    seller?: {
        id: number
        nickname?: string
        avatar?: string
        mobile?: string
    }
}

// 用户类型
export type AuthStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface UserInfo {
    id: number
    mobile: string
    nickname?: string
    avatar?: string
    realName?: string
    authStatus?: AuthStatus
    isVerified?: boolean
    balance?: number
    totalOrders?: number
    totalCars?: number
}

// 发布车源表单
export interface PublishCarForm {
    brandId: number | null
    seriesId: number | null
    firstRegDate: string
    mileage: number | null
    displacement: number | null
    gearbox: GearboxType | null
    emissionStandard: EmissionStandard | null
    provinceCode: string
    cityCode: string
    districtCode: string
    price: number | null
    vin: string
    images: string[]
    highlightDesc: string
    color?: string
    contactName: string
    contactMobile: string
}

// 订单类型
export type OrderStatus = 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded'

export interface Order {
    id: number
    orderNo: string
    carId: number
    car?: {
        id: number
        title: string
        coverImage: string
        price: number
        firstRegDate?: string
        mileage?: number
    }
    amount: number
    status: OrderStatus
    buyerId: number
    sellerId: number
    paymentMethod?: 'alipay' | 'wechat'
    paidAt?: string
    createdAt: string
    updatedAt: string
}

// 兼容旧类型
export type OrderItem = Order

// 分页
export interface PageParams {
    page: number
    pageSize: number
}

export interface PageResult<T> {
    list: T[]
    total: number
    page: number
    pageSize: number
}

// 支付类型
export type PaymentChannel = 'wechat' | 'alipay'
export type PaymentStatus = 'pending' | 'paid' | 'closed' | 'refunded'

export interface PaymentInfo {
    paymentId: number
    paymentNo: string
    channel: PaymentChannel
    amount: number
    status: PaymentStatus
    expireTime: string
    paidAt?: string
}

// 搜索筛选
export interface SearchFilters {
    keyword: string
    brandId: number | null
    priceMin: number | null
    priceMax: number | null
    provinceCode: string | null
    cityCode: string | null
    districtCode: string | null
}

// VIN 验证结果
export interface VinValidationResult {
    valid: boolean
    duplicate: boolean
    message?: string
}
