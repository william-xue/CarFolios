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

export interface City {
    code: string
    name: string
    province: string
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
    gearbox?: GearboxType
    tags?: string[]
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
    firstRegDate: string
    mileage: number
    displacement: number
    gearbox: GearboxType
    emissionStandard: EmissionStandard
    useType: UseType
    transferCount: number
    cityCode: string
    cityName: string
    address: string
    price: number
    originalPrice?: number
    status: CarStatus
    coverImage: string
    images: string[]
    video?: string
    highlightDesc: string
    color?: string
    plateCity?: string
    configs?: string[]
    createdAt: string
}

// 用户类型
export type AuthStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface UserInfo {
    id: number
    mobile: string
    nickname: string
    avatar: string
    realName?: string
    authStatus: AuthStatus
    balance: number
    totalOrders: number
    totalCars: number
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
    cityCode: string
    price: number | null
    images: string[]
    highlightDesc: string
    color?: string
    contactName: string
    contactMobile: string
}

// 订单类型
export type OrderStatus = 'pending' | 'paid' | 'closed' | 'cancelled' | 'refunded'

export interface OrderItem {
    id: number
    orderNo: string
    carId: number
    carTitle: string
    carImage: string
    carPrice: number
    depositAmount: number
    status: OrderStatus
    buyerId: number
    sellerId: number
    createdAt: string
    updatedAt: string
}

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
