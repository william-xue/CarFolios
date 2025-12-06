// 通用类型
export interface ApiResponse<T> {
    code: number
    message: string
    data: T
}

export interface PageParams {
    page: number
    pageSize: number
}

export interface PageResult<T> {
    list: T[]
    page: number
    pageSize: number
    total: number
}

// 用户类型
export type AuthStatus = 'unverified' | 'pending' | 'verified' | 'rejected'
export type RoleType = 'buyer' | 'seller' | 'dealer' | 'admin'
export type UserStatus = 'enabled' | 'disabled'

export interface User {
    id: number
    mobile: string
    nickname: string
    avatar: string
    realName?: string
    idCard?: string
    authStatus: AuthStatus
    roleType: RoleType
    status: UserStatus
    createdAt: string
    updatedAt: string
}

export interface AdminUser {
    id: number
    username: string
    nickname: string
    avatar: string
    roles: string[]
    status: UserStatus
    createdAt: string
}

export interface LoginResult {
    token: string
    user: AdminUser
}

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
    series?: Series[]
}

export interface Series {
    id: number
    brandId: number
    name: string
    models?: Model[]
}

export interface Model {
    id: number
    seriesId: number
    name: string
    year: string
}

export interface City {
    code: string
    name: string
    province: string
}

export interface Car {
    id: number
    title: string
    ownerId: number
    ownerName?: string
    sourceType: SourceType
    brandId: number
    brandName: string
    seriesId: number
    seriesName: string
    modelId: number
    modelName: string
    firstRegDate: string
    mileage: number
    displacement: number
    gearbox: GearboxType
    emissionStandard: EmissionStandard
    useType: UseType
    transferCount: number
    // 位置信息
    provinceId?: number
    provinceName?: string
    cityCode: string
    cityName: string
    districtId?: number
    districtName?: string
    address: string
    lat?: number
    lng?: number
    // VIN 和车牌
    vin?: string
    plateNumber?: string
    engineNumber?: string
    // 有效期信息
    publishedAt?: string
    expiresAt?: string
    renewedAt?: string
    renewalCount?: number
    soldAt?: string
    // 价格和其他
    price: number
    originalPrice?: number
    status: CarStatus
    coverImage: string
    images: string[]
    video?: string
    highlightDesc: string
    inspectionReport?: string
    color?: string
    plateCity?: string
    annualInspection?: string
    insurance?: string
    configs?: string[]
    rejectReason?: string
    createdAt: string
    updatedAt: string
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
    status: CarStatus
    ownerName?: string
    createdAt: string
}

export interface CarFilters {
    keyword?: string
    brandId?: number
    status?: CarStatus
    sourceType?: SourceType
    cityCode?: string
}

// 发布/编辑车源表单
export interface CarForm {
    brandId: number | null
    seriesId: number | null
    modelId: number | null
    firstRegDate: string
    mileage: number | null
    displacement: number | null
    gearbox: GearboxType | null
    emissionStandard: EmissionStandard | null
    useType: UseType | null
    transferCount: number
    cityCode: string
    address: string
    price: number | null
    originalPrice?: number | null
    images: string[]
    video?: string
    highlightDesc: string
    inspectionReport?: string
    color?: string
    plateCity?: string
    annualInspection?: string
    insurance?: string
    configs?: string[]
}

// 订单类型
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'closed' | 'refunded'

export interface Order {
    id: number
    orderNo: string
    carId: number
    carTitle: string
    buyerId: number
    buyerName: string
    buyerMobile: string
    sellerId: number
    sellerName: string
    amount: number
    totalPrice: number
    status: OrderStatus
    createdAt: string
    payTime?: string
}

// 平台用户（买家/卖家）
export interface PlatformUser {
    id: number
    mobile: string
    nickname: string
    avatar: string
    realName?: string
    idCard?: string
    authStatus: AuthStatus
    roleType: RoleType
    status: UserStatus
    balance: number
    totalOrders: number
    totalCars: number
    createdAt: string
    updatedAt: string
}

export interface UserFilters {
    keyword?: string
    roleType?: RoleType
    authStatus?: AuthStatus
    status?: UserStatus
}

// 订单类型
export type PaymentMethod = 'alipay' | 'wechat' | 'bank' | 'offline'

export interface OrderItem {
    id: number
    orderNo: string
    carId: number
    carTitle: string
    carImage: string
    carPrice: number
    buyerId: number
    buyerName: string
    buyerMobile: string
    sellerId: number
    sellerName: string
    sellerMobile: string
    depositAmount: number
    totalAmount: number
    paymentMethod?: PaymentMethod
    status: OrderStatus
    remark?: string
    createdAt: string
    paidAt?: string
    completedAt?: string
    cancelledAt?: string
    cancelReason?: string
}

export interface OrderFilters {
    keyword?: string
    status?: OrderStatus
    buyerId?: number
    sellerId?: number
}

// 统计数据
export interface DashboardStats {
    totalCars: number
    onlineCars: number
    pendingCars: number
    totalOrders: number
    pendingOrders: number
    completedOrders: number
    totalUsers: number
    todayNewCars: number
    todayNewOrders: number
    todayNewUsers: number
    totalRevenue: number
}
