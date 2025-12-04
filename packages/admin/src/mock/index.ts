import type { Car, CarFilters, PageParams, PageResult, AdminUser, DashboardStats } from '@/types'
import { storage } from '@/utils/storage'
import { initialCars, brands, seriesData, modelData, cities, adminUsers } from './data'

const CARS_KEY = 'cars'
const CAR_ID_KEY = 'car_next_id'

// 初始化 Mock 数据
export function initMockData() {
    if (!storage.get(CARS_KEY)) {
        storage.set(CARS_KEY, initialCars)
        storage.set(CAR_ID_KEY, initialCars.length + 1)
    }
}

// 获取所有车源
function getCars(): Car[] {
    return storage.get<Car[]>(CARS_KEY) || []
}

// 保存车源
function saveCars(cars: Car[]) {
    storage.set(CARS_KEY, cars)
}

// 获取下一个 ID
function getNextId(): number {
    const id = storage.get<number>(CAR_ID_KEY) || 1
    storage.set(CAR_ID_KEY, id + 1)
    return id
}

// Mock API 延迟
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ============ 认证相关 ============
export async function mockLogin(username: string, password: string): Promise<{ token: string; user: AdminUser }> {
    await delay(500)
    const user = adminUsers.find((u) => u.username === username)
    if (!user || password !== '123456') {
        throw new Error('用户名或密码错误')
    }
    return {
        token: `mock_token_${user.id}_${Date.now()}`,
        user,
    }
}

// ============ 车源相关 ============
export async function mockGetCars(
    params: CarFilters & PageParams
): Promise<PageResult<Car>> {
    await delay(300)
    let cars = getCars()

    // 筛选
    if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        cars = cars.filter(
            (c) =>
                c.title.toLowerCase().includes(keyword) ||
                c.brandName.toLowerCase().includes(keyword)
        )
    }
    if (params.brandId) {
        cars = cars.filter((c) => c.brandId === params.brandId)
    }
    if (params.status) {
        cars = cars.filter((c) => c.status === params.status)
    }
    if (params.sourceType) {
        cars = cars.filter((c) => c.sourceType === params.sourceType)
    }
    if (params.cityCode) {
        cars = cars.filter((c) => c.cityCode === params.cityCode)
    }

    // 排序（按创建时间倒序）
    cars.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 分页
    const total = cars.length
    const start = (params.page - 1) * params.pageSize
    const list = cars.slice(start, start + params.pageSize)

    return {
        list,
        page: params.page,
        pageSize: params.pageSize,
        total,
    }
}

export async function mockGetCarDetail(id: number): Promise<Car | null> {
    await delay(200)
    const cars = getCars()
    return cars.find((c) => c.id === id) || null
}

export async function mockCreateCar(data: Partial<Car>): Promise<Car> {
    await delay(500)
    const cars = getCars()
    const now = new Date().toISOString()

    // 根据品牌、车系、车型生成标题
    const brand = brands.find((b) => b.id === data.brandId)
    const series = seriesData[data.brandId!]?.find((s) => s.id === data.seriesId)
    const model = modelData[data.seriesId!]?.find((m) => m.id === data.modelId)
    const city = cities.find((c) => c.code === data.cityCode)

    const newCar: Car = {
        id: getNextId(),
        title: data.title || `${brand?.name || ''} ${series?.name || ''} ${model?.name || ''}`.trim(),
        ownerId: 1,
        ownerName: '平台自营',
        sourceType: 'platform',
        brandId: data.brandId!,
        brandName: brand?.name || '',
        seriesId: data.seriesId!,
        seriesName: series?.name || '',
        modelId: data.modelId!,
        modelName: model?.name || '',
        firstRegDate: data.firstRegDate || '',
        mileage: data.mileage || 0,
        displacement: data.displacement || 0,
        gearbox: data.gearbox || 'AT',
        emissionStandard: data.emissionStandard || '国六',
        useType: data.useType || 'family',
        transferCount: data.transferCount || 0,
        cityCode: data.cityCode || '',
        cityName: city?.name || '',
        address: data.address || '',
        price: data.price || 0,
        originalPrice: data.originalPrice,
        status: 'on', // 管理端发布直接上架
        coverImage: data.images?.[0] || '',
        images: data.images || [],
        video: data.video,
        highlightDesc: data.highlightDesc || '',
        inspectionReport: data.inspectionReport,
        color: data.color,
        plateCity: data.plateCity,
        annualInspection: data.annualInspection,
        insurance: data.insurance,
        configs: data.configs,
        createdAt: now,
        updatedAt: now,
    }

    cars.unshift(newCar)
    saveCars(cars)
    return newCar
}

export async function mockUpdateCar(id: number, data: Partial<Car>): Promise<Car> {
    await delay(500)
    const cars = getCars()
    const index = cars.findIndex((c) => c.id === id)
    if (index === -1) {
        throw new Error('车源不存在')
    }

    const brand = brands.find((b) => b.id === data.brandId)
    const series = seriesData[data.brandId!]?.find((s) => s.id === data.seriesId)
    const model = modelData[data.seriesId!]?.find((m) => m.id === data.modelId)
    const city = cities.find((c) => c.code === data.cityCode)

    const updatedCar: Car = {
        ...cars[index],
        ...data,
        brandName: brand?.name || cars[index].brandName,
        seriesName: series?.name || cars[index].seriesName,
        modelName: model?.name || cars[index].modelName,
        cityName: city?.name || cars[index].cityName,
        coverImage: data.images?.[0] || cars[index].coverImage,
        updatedAt: new Date().toISOString(),
    }

    cars[index] = updatedCar
    saveCars(cars)
    return updatedCar
}

export async function mockUpdateCarStatus(id: number, status: Car['status'], reason?: string): Promise<void> {
    await delay(300)
    const cars = getCars()
    const index = cars.findIndex((c) => c.id === id)
    if (index === -1) {
        throw new Error('车源不存在')
    }

    cars[index].status = status
    cars[index].updatedAt = new Date().toISOString()
    if (reason) {
        cars[index].rejectReason = reason
    }
    saveCars(cars)
}

export async function mockDeleteCar(id: number): Promise<void> {
    await delay(300)
    const cars = getCars()
    const index = cars.findIndex((c) => c.id === id)
    if (index === -1) {
        throw new Error('车源不存在')
    }
    cars.splice(index, 1)
    saveCars(cars)
}

// ============ 基础数据 ============
export async function mockGetBrands() {
    await delay(100)
    return brands
}

export async function mockGetSeries(brandId: number) {
    await delay(100)
    return seriesData[brandId] || []
}

export async function mockGetModels(seriesId: number) {
    await delay(100)
    return modelData[seriesId] || []
}

export async function mockGetCities() {
    await delay(100)
    return cities
}

// ============ 统计数据 ============
export async function mockGetDashboardStats(): Promise<DashboardStats> {
    await delay(300)
    const cars = getCars()
    const today = new Date().toISOString().split('T')[0]

    return {
        totalCars: cars.length,
        onlineCars: cars.filter((c) => c.status === 'on').length,
        pendingCars: cars.filter((c) => c.status === 'pending').length,
        totalOrders: 0,
        totalUsers: 100,
        todayNewCars: cars.filter((c) => c.createdAt.startsWith(today)).length,
        todayNewOrders: 0,
    }
}

// 初始化
initMockData()
