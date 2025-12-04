import type { Car, CarFilters, PageParams, PageResult, AdminUser, DashboardStats, PlatformUser, UserFilters, OrderItem, OrderFilters, OrderStatus } from '@/types'
import { storage } from '@/utils/storage'
import { initialCars, brands, seriesData, modelData, cities, adminUsers, platformUsers, initialOrders } from './data'

const CARS_KEY = 'cars'
const CAR_ID_KEY = 'car_next_id'
const USERS_KEY = 'platform_users'
const USER_ID_KEY = 'user_next_id'
const ORDERS_KEY = 'orders'
const ORDER_ID_KEY = 'order_next_id'
const IMAGES_KEY = 'uploaded_images'

// 初始化 Mock 数据
export function initMockData() {
    if (!storage.get(CARS_KEY)) {
        storage.set(CARS_KEY, initialCars)
        storage.set(CAR_ID_KEY, initialCars.length + 1)
    }
    if (!storage.get(USERS_KEY)) {
        storage.set(USERS_KEY, platformUsers)
        storage.set(USER_ID_KEY, platformUsers.length + 1)
    }
    if (!storage.get(ORDERS_KEY)) {
        storage.set(ORDERS_KEY, initialOrders)
        storage.set(ORDER_ID_KEY, initialOrders.length + 1)
    }
    if (!storage.get(IMAGES_KEY)) {
        storage.set(IMAGES_KEY, [])
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

// ============ 图片上传 ============
export async function mockUploadImage(file: File): Promise<string> {
    await delay(800)
    // 使用 FileReader 将图片转为 base64
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            const base64 = reader.result as string
            // 保存到 localStorage（实际项目中应上传到服务器）
            const images = storage.get<string[]>(IMAGES_KEY) || []
            images.push(base64)
            storage.set(IMAGES_KEY, images)
            resolve(base64)
        }
        reader.onerror = () => reject(new Error('图片读取失败'))
        reader.readAsDataURL(file)
    })
}

// ============ 用户管理 ============
function getUsers(): PlatformUser[] {
    return storage.get<PlatformUser[]>(USERS_KEY) || []
}

function saveUsers(users: PlatformUser[]) {
    storage.set(USERS_KEY, users)
}

function getNextUserId(): number {
    const id = storage.get<number>(USER_ID_KEY) || 1
    storage.set(USER_ID_KEY, id + 1)
    return id
}

export async function mockGetUsers(params: UserFilters & PageParams): Promise<PageResult<PlatformUser>> {
    await delay(300)
    let users = getUsers()

    // 筛选
    if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        users = users.filter(
            (u) =>
                u.nickname.toLowerCase().includes(keyword) ||
                u.mobile.includes(keyword) ||
                (u.realName && u.realName.toLowerCase().includes(keyword))
        )
    }
    if (params.roleType) {
        users = users.filter((u) => u.roleType === params.roleType)
    }
    if (params.authStatus) {
        users = users.filter((u) => u.authStatus === params.authStatus)
    }
    if (params.status) {
        users = users.filter((u) => u.status === params.status)
    }

    // 排序
    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 分页
    const total = users.length
    const start = (params.page - 1) * params.pageSize
    const list = users.slice(start, start + params.pageSize)

    return { list, page: params.page, pageSize: params.pageSize, total }
}

export async function mockGetUserDetail(id: number): Promise<PlatformUser | null> {
    await delay(200)
    const users = getUsers()
    return users.find((u) => u.id === id) || null
}

export async function mockUpdateUserStatus(id: number, status: PlatformUser['status']): Promise<void> {
    await delay(300)
    const users = getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('用户不存在')
    users[index].status = status
    users[index].updatedAt = new Date().toISOString()
    saveUsers(users)
}

export async function mockUpdateUserAuth(id: number, authStatus: PlatformUser['authStatus']): Promise<void> {
    await delay(300)
    const users = getUsers()
    const index = users.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('用户不存在')
    users[index].authStatus = authStatus
    users[index].updatedAt = new Date().toISOString()
    saveUsers(users)
}

// ============ 订单管理 ============
function getOrders(): OrderItem[] {
    return storage.get<OrderItem[]>(ORDERS_KEY) || []
}

function saveOrders(orders: OrderItem[]) {
    storage.set(ORDERS_KEY, orders)
}

function getNextOrderId(): number {
    const id = storage.get<number>(ORDER_ID_KEY) || 1
    storage.set(ORDER_ID_KEY, id + 1)
    return id
}

export async function mockGetOrders(params: OrderFilters & PageParams): Promise<PageResult<OrderItem>> {
    await delay(300)
    let orders = getOrders()

    // 筛选
    if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        orders = orders.filter(
            (o) =>
                o.orderNo.toLowerCase().includes(keyword) ||
                o.carTitle.toLowerCase().includes(keyword) ||
                o.buyerName.toLowerCase().includes(keyword)
        )
    }
    if (params.status) {
        orders = orders.filter((o) => o.status === params.status)
    }
    if (params.buyerId) {
        orders = orders.filter((o) => o.buyerId === params.buyerId)
    }
    if (params.sellerId) {
        orders = orders.filter((o) => o.sellerId === params.sellerId)
    }

    // 排序
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // 分页
    const total = orders.length
    const start = (params.page - 1) * params.pageSize
    const list = orders.slice(start, start + params.pageSize)

    return { list, page: params.page, pageSize: params.pageSize, total }
}

export async function mockGetOrderDetail(id: number): Promise<OrderItem | null> {
    await delay(200)
    const orders = getOrders()
    return orders.find((o) => o.id === id) || null
}

export async function mockUpdateOrderStatus(id: number, status: OrderStatus, reason?: string): Promise<void> {
    await delay(300)
    const orders = getOrders()
    const index = orders.findIndex((o) => o.id === id)
    if (index === -1) throw new Error('订单不存在')

    const now = new Date().toISOString()
    orders[index].status = status

    if (status === 'paid') {
        orders[index].paidAt = now
    } else if (status === 'closed') {
        orders[index].completedAt = now
    } else if (status === 'cancelled') {
        orders[index].cancelledAt = now
        orders[index].cancelReason = reason
    }

    saveOrders(orders)
}

// ============ 统计数据（更新） ============
export async function mockGetDashboardStats(): Promise<DashboardStats> {
    await delay(300)
    const cars = getCars()
    const users = getUsers()
    const orders = getOrders()
    const today = new Date().toISOString().split('T')[0]

    return {
        totalCars: cars.length,
        onlineCars: cars.filter((c) => c.status === 'on').length,
        pendingCars: cars.filter((c) => c.status === 'pending').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === 'pending').length,
        completedOrders: orders.filter((o) => o.status === 'closed').length,
        totalUsers: users.length,
        todayNewCars: cars.filter((c) => c.createdAt.startsWith(today)).length,
        todayNewOrders: orders.filter((o) => o.createdAt.startsWith(today)).length,
        todayNewUsers: users.filter((u) => u.createdAt.startsWith(today)).length,
        totalRevenue: orders.filter((o) => o.status === 'closed').reduce((sum, o) => sum + o.depositAmount, 0),
    }
}

// 初始化
initMockData()
