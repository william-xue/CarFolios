import type { CarListItem, CarDetail, UserInfo, Brand, City, PageResult, OrderItem } from '@/types'
import { storage } from '@/utils/storage'
import { carList, carDetails, defaultUser, brands, seriesData, cities } from './data'

const USER_KEY = 'user'
const MY_CARS_KEY = 'my_cars'
const MY_ORDERS_KEY = 'my_orders'
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 初始化用户
export function initUser() {
    if (!storage.get(USER_KEY)) {
        storage.set(USER_KEY, defaultUser)
    }
}

// ============ 车源相关 ============
export async function mockGetCarList(params: { page: number; pageSize: number; keyword?: string; brandId?: number }): Promise<PageResult<CarListItem>> {
    await delay(300)
    let list = [...carList]

    if (params.keyword) {
        const keyword = params.keyword.toLowerCase()
        list = list.filter(c => c.title.toLowerCase().includes(keyword))
    }
    if (params.brandId) {
        // 简单模拟品牌筛选
        list = list.filter(c => c.title.includes(brands.find(b => b.id === params.brandId)?.name || ''))
    }

    const total = list.length
    const start = (params.page - 1) * params.pageSize
    const pageList = list.slice(start, start + params.pageSize)

    return { list: pageList, total, page: params.page, pageSize: params.pageSize }
}

export async function mockGetCarDetail(id: number): Promise<CarDetail | null> {
    await delay(200)
    return carDetails[id] || null
}

export async function mockGetRecommendCars(): Promise<CarListItem[]> {
    await delay(200)
    return carList.slice(0, 4)
}

// ============ 基础数据 ============
export async function mockGetBrands(): Promise<Brand[]> {
    await delay(100)
    return brands
}

export async function mockGetSeries(brandId: number) {
    await delay(100)
    return seriesData[brandId] || []
}

export async function mockGetCities(): Promise<City[]> {
    await delay(100)
    return cities
}

// ============ 用户相关 ============
export async function mockGetUserInfo(): Promise<UserInfo> {
    await delay(200)
    return storage.get<UserInfo>(USER_KEY) || defaultUser
}

export async function mockLogin(mobile: string, code: string): Promise<UserInfo> {
    await delay(500)
    if (code !== '1234') {
        throw new Error('验证码错误')
    }
    const user: UserInfo = {
        ...defaultUser,
        mobile: mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
    }
    storage.set(USER_KEY, user)
    return user
}

export async function mockLogout(): Promise<void> {
    await delay(200)
    storage.remove(USER_KEY)
}

// ============ 发布车源 ============
export async function mockPublishCar(data: any): Promise<{ id: number }> {
    await delay(800)
    // 模拟发布成功
    return { id: Date.now() }
}

// ============ 图片上传 ============
export async function mockUploadImage(file: File): Promise<string> {
    await delay(500)
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = () => reject(new Error('上传失败'))
        reader.readAsDataURL(file)
    })
}

// ============ 我的车源 ============
export async function getMyCars(): Promise<CarListItem[]> {
    await delay(300)
    // 获取用户发布的车源（从 localStorage 或返回示例数据）
    const myCars = storage.get<CarListItem[]>(MY_CARS_KEY)
    if (myCars && myCars.length > 0) {
        return myCars
    }
    // 返回示例数据（模拟用户已发布的车源）
    return carList.slice(0, 2)
}

export async function saveMyCar(car: CarListItem): Promise<void> {
    const myCars = storage.get<CarListItem[]>(MY_CARS_KEY) || []
    myCars.unshift(car)
    storage.set(MY_CARS_KEY, myCars)
}

// ============ 我的订单 ============
export async function getMyOrders(): Promise<OrderItem[]> {
    await delay(300)
    // 获取用户订单（从 localStorage 或返回示例数据）
    const myOrders = storage.get<OrderItem[]>(MY_ORDERS_KEY)
    if (myOrders && myOrders.length > 0) {
        return myOrders
    }
    // 返回示例订单数据
    const sampleOrders: OrderItem[] = [
        {
            id: 1,
            orderNo: 'ORD202412040001',
            carId: 1,
            carTitle: carList[0]?.title || '2023款 宝马3系 325Li M运动套装',
            carImage: carList[0]?.coverImage || 'https://img1.baidu.com/it/u=2048195462,703560066&fm=253',
            carPrice: carList[0]?.price || 28.8,
            depositAmount: 5000,
            status: 'paid',
            buyerId: 1,
            sellerId: 2,
            createdAt: '2024-12-01T10:30:00Z',
            updatedAt: '2024-12-01T10:35:00Z',
        },
        {
            id: 2,
            orderNo: 'ORD202412030002',
            carId: 2,
            carTitle: carList[1]?.title || '2022款 奔驰C级 C260L 运动版',
            carImage: carList[1]?.coverImage || 'https://img2.baidu.com/it/u=1234567890',
            carPrice: carList[1]?.price || 32.5,
            depositAmount: 5000,
            status: 'pending',
            buyerId: 1,
            sellerId: 3,
            createdAt: '2024-12-03T14:20:00Z',
            updatedAt: '2024-12-03T14:20:00Z',
        },
    ]
    return sampleOrders
}

export async function createOrder(carId: number, depositAmount: number): Promise<OrderItem> {
    await delay(500)
    const car = carDetails[carId]
    if (!car) throw new Error('车源不存在')

    const order: OrderItem = {
        id: Date.now(),
        orderNo: `ORD${Date.now()}`,
        carId,
        carTitle: car.title,
        carImage: car.coverImage,
        carPrice: car.price,
        depositAmount,
        status: 'pending',
        buyerId: 1,
        sellerId: car.ownerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }

    const myOrders = storage.get<OrderItem[]>(MY_ORDERS_KEY) || []
    myOrders.unshift(order)
    storage.set(MY_ORDERS_KEY, myOrders)

    return order
}

// 初始化
initUser()
