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
    lat?: number
    lng?: number
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

// ============================================
// 车源发布增强 - 新增类型和常量
// ============================================

// 图片项状态
export type ImageStatus = 'existing' | 'uploading' | 'done' | 'failed' | 'deleted'

// 图片项接口
export interface ImageItem {
    id?: number | string
    url: string
    status: ImageStatus
    file?: File
    message?: string
}

// 车辆配置选项
export const CAR_CONFIG_OPTIONS = [
    { value: 'sunroof', label: '天窗' },
    { value: 'panoramic_sunroof', label: '全景天窗' },
    { value: 'navigation', label: '导航系统' },
    { value: 'reversing_camera', label: '倒车影像' },
    { value: 'reversing_radar', label: '倒车雷达' },
    { value: 'cruise_control', label: '定速巡航' },
    { value: 'adaptive_cruise', label: '自适应巡航' },
    { value: 'leather_seats', label: '真皮座椅' },
    { value: 'heated_seats', label: '座椅加热' },
    { value: 'ventilated_seats', label: '座椅通风' },
    { value: 'electric_seats', label: '电动座椅' },
    { value: 'keyless_entry', label: '无钥匙进入' },
    { value: 'keyless_start', label: '一键启动' },
    { value: 'auto_parking', label: '自动泊车' },
    { value: 'lane_departure', label: '车道偏离预警' },
    { value: 'blind_spot', label: '盲点监测' },
] as const

// 使用性质选项
export const USE_TYPE_OPTIONS = [
    { value: 'family', label: '家用' },
    { value: 'business', label: '商用' },
    { value: 'official', label: '公务' },
] as const

// 排放标准选项
export const EMISSION_STANDARD_OPTIONS = [
    { value: 'guoliu', label: '国六' },
    { value: 'guowu', label: '国五' },
    { value: 'guosi', label: '国四' },
    { value: 'guosan', label: '国三' },
] as const

// 变速箱类型选项
export const GEARBOX_OPTIONS = [
    { value: 'AT', label: '自动' },
    { value: 'MT', label: '手动' },
    { value: 'DCT', label: '双离合' },
    { value: 'CVT', label: '无级变速' },
] as const

// 燃料类型选项
export const FUEL_TYPE_OPTIONS = [
    { value: 'gasoline', label: '汽油' },
    { value: 'diesel', label: '柴油' },
    { value: 'electric', label: '纯电动' },
    { value: 'hybrid', label: '油电混合' },
    { value: 'phev', label: '插电混动' },
] as const

// 增强版车源表单数据
export interface CarFormData {
    // 基本信息
    brandId: number | null
    seriesId: number | null
    title: string
    price: number | null
    originalPrice: number | null

    // 车况信息
    firstRegDate: string
    mileage: number | null
    gearbox: string
    fuelType: string
    displacement: number | null
    color: string
    vin: string
    plateNumber: string
    transferCount: number
    useType: string
    emissionStandard: string

    // 地理位置
    provinceId: number | null
    provinceName: string
    cityId: number | null
    cityName: string
    districtId: number | null
    districtName: string
    address: string

    // 媒体
    images: ImageItem[]
    video: string
    videoThumbnail: string

    // 联系方式
    contactPhone: string
    usePlatformPhone: boolean

    // 描述和配置
    highlightDesc: string
    configs: string[]
}

// 创建空表单数据
export function createEmptyCarFormData(): CarFormData {
    return {
        brandId: null,
        seriesId: null,
        title: '',
        price: null,
        originalPrice: null,
        firstRegDate: '',
        mileage: null,
        gearbox: '',
        fuelType: '',
        displacement: null,
        color: '',
        vin: '',
        plateNumber: '',
        transferCount: 0,
        useType: '',
        emissionStandard: '',
        provinceId: null,
        provinceName: '',
        cityId: null,
        cityName: '',
        districtId: null,
        districtName: '',
        address: '',
        images: [],
        video: '',
        videoThumbnail: '',
        contactPhone: '',
        usePlatformPhone: false,
        highlightDesc: '',
        configs: []
    }
}
