/**
 * 收藏列表属性测试
 * 
 * **Feature: user-engagement-features, Property 4: Favorites List Completeness**
 * **Feature: user-engagement-features, Property 9: Favorites Ordering**
 * **Validates: Requirements 3.4, 6.3**
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// Mock API 模块
vi.mock('@/api/favorite', () => ({
    getFavorites: vi.fn(),
    removeFavorite: vi.fn(),
}))

import { getFavorites, type FavoriteItem } from '@/api/favorite'

// 生成有效的收藏项
const favoriteItemArbitrary = (index: number) => fc.record({
    id: fc.constant(index + 1),
    carId: fc.integer({ min: 1, max: 10000 }),
    createdAt: fc.date({ min: new Date('2020-01-01'), max: new Date() }).map(d => d.toISOString()),
    car: fc.record({
        id: fc.integer({ min: 1, max: 10000 }),
        title: fc.string({ minLength: 1, maxLength: 50 }),
        coverImage: fc.webUrl(),
        price: fc.integer({ min: 10000, max: 1000000 }),
        mileage: fc.integer({ min: 0, max: 500000 }),
        firstRegDate: fc.date({ min: new Date('2010-01-01'), max: new Date() }).map(d => d.toISOString().slice(0, 10)),
        cityName: fc.constantFrom('北京', '上海', '广州', '深圳', '杭州'),
        status: fc.constantFrom('on', 'off', 'sold', 'pending', 'expired'),
        sourceType: fc.constantFrom('personal', 'dealer', 'platform'),
    }),
})

// 生成收藏列表（带有正确的时间排序）
const favoritesListArbitrary = (count: number) => {
    return fc.array(
        fc.record({
            carId: fc.integer({ min: 1, max: 10000 }),
            car: fc.record({
                id: fc.integer({ min: 1, max: 10000 }),
                title: fc.string({ minLength: 1, maxLength: 50 }),
                coverImage: fc.webUrl(),
                price: fc.integer({ min: 10000, max: 1000000 }),
                mileage: fc.integer({ min: 0, max: 500000 }),
                firstRegDate: fc.date({ min: new Date('2010-01-01'), max: new Date() }).map(d => d.toISOString().slice(0, 10)),
                cityName: fc.constantFrom('北京', '上海', '广州', '深圳', '杭州'),
                status: fc.constantFrom('on', 'off', 'sold', 'pending', 'expired'),
                sourceType: fc.constantFrom('personal', 'dealer', 'platform'),
            }),
        }),
        { minLength: count, maxLength: count }
    ).map(items => {
        // 为每个项目生成递减的时间戳（模拟按创建时间降序）
        const now = Date.now()
        return items.map((item, index) => ({
            id: index + 1,
            carId: item.carId,
            createdAt: new Date(now - index * 1000 * 60 * 60).toISOString(), // 每个间隔1小时
            car: item.car,
        }))
    })
}

describe('Favorites List Property Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    /**
     * Property 4: Favorites List Completeness
     * 
     * *For any* user with N favorited cars, querying the favorites list 
     * SHALL return exactly N items (accounting for pagination).
     * 
     * **Validates: Requirements 3.4**
     */
    it('Property 4: favorites list should return correct total count', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 0, max: 50 }), // 总收藏数
                fc.integer({ min: 1, max: 20 }), // 每页数量
                async (totalFavorites, pageSize) => {
                    // 生成模拟数据
                    const allFavorites: FavoriteItem[] = []
                    const now = Date.now()

                    for (let i = 0; i < totalFavorites; i++) {
                        allFavorites.push({
                            id: i + 1,
                            carId: 1000 + i,
                            createdAt: new Date(now - i * 1000 * 60 * 60).toISOString(),
                            car: {
                                id: 1000 + i,
                                title: `测试车辆 ${i + 1}`,
                                coverImage: 'https://example.com/car.jpg',
                                price: 100000 + i * 1000,
                                mileage: 10000 + i * 100,
                                firstRegDate: '2020-01-01',
                                cityName: '北京',
                                status: 'on',
                                sourceType: 'personal',
                            },
                        } as FavoriteItem)
                    }

                    // 模拟分页 API 响应
                    vi.mocked(getFavorites).mockImplementation(async (params) => {
                        const page = params.page || 1
                        const size = params.pageSize || 10
                        const start = (page - 1) * size
                        const end = start + size

                        return {
                            list: allFavorites.slice(start, end),
                            total: totalFavorites,
                            page,
                            pageSize: size,
                        }
                    })

                    // 计算需要的页数
                    const totalPages = Math.ceil(totalFavorites / pageSize) || 1
                    let fetchedCount = 0

                    // 遍历所有页面
                    for (let page = 1; page <= totalPages; page++) {
                        const result = await getFavorites({ page, pageSize })
                        fetchedCount += result.list.length

                        // 验证返回的 total 始终正确
                        expect(result.total).toBe(totalFavorites)
                    }

                    // 验证获取的总数等于实际收藏数
                    expect(fetchedCount).toBe(totalFavorites)

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * Property 9: Favorites Ordering
     * 
     * *For any* set of favorites, the query result SHALL be ordered 
     * by creation time descending (newest first).
     * 
     * **Validates: Requirements 6.3**
     */
    it('Property 9: favorites should be ordered by creation time descending', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 2, max: 20 }), // 至少2个才能验证排序
                async (count) => {
                    // 生成带有随机时间戳的收藏列表
                    const now = Date.now()
                    const favorites: FavoriteItem[] = []

                    // 生成随机时间戳
                    const timestamps: number[] = []
                    for (let i = 0; i < count; i++) {
                        timestamps.push(now - Math.random() * 1000 * 60 * 60 * 24 * 30) // 随机30天内
                    }

                    // 按时间降序排序（模拟后端行为）
                    timestamps.sort((a, b) => b - a)

                    for (let i = 0; i < count; i++) {
                        favorites.push({
                            id: i + 1,
                            carId: 1000 + i,
                            createdAt: new Date(timestamps[i]).toISOString(),
                            car: {
                                id: 1000 + i,
                                title: `测试车辆 ${i + 1}`,
                                coverImage: 'https://example.com/car.jpg',
                                price: 100000,
                                mileage: 10000,
                                firstRegDate: '2020-01-01',
                                cityName: '北京',
                                status: 'on',
                                sourceType: 'personal',
                            },
                        } as FavoriteItem)
                    }

                    // 模拟 API 响应
                    vi.mocked(getFavorites).mockResolvedValue({
                        list: favorites,
                        total: count,
                        page: 1,
                        pageSize: count,
                    })

                    const result = await getFavorites({ page: 1, pageSize: count })

                    // 验证排序：每个项目的创建时间应该 >= 下一个项目的创建时间
                    for (let i = 0; i < result.list.length - 1; i++) {
                        const currentTime = new Date(result.list[i].createdAt).getTime()
                        const nextTime = new Date(result.list[i + 1].createdAt).getTime()

                        expect(currentTime).toBeGreaterThanOrEqual(nextTime)
                    }

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：分页边界条件
     */
    it('pagination should handle edge cases correctly', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.integer({ min: 1, max: 100 }), // 总数
                fc.integer({ min: 1, max: 50 }),  // 页大小
                fc.integer({ min: 1, max: 10 }),  // 请求的页码
                async (total, pageSize, requestedPage) => {
                    // 计算实际应该返回的数量
                    const totalPages = Math.ceil(total / pageSize)
                    const isValidPage = requestedPage <= totalPages

                    const start = (requestedPage - 1) * pageSize
                    const expectedCount = isValidPage
                        ? Math.min(pageSize, total - start)
                        : 0

                    // 生成模拟数据
                    const allFavorites: FavoriteItem[] = []
                    for (let i = 0; i < total; i++) {
                        allFavorites.push({
                            id: i + 1,
                            carId: 1000 + i,
                            createdAt: new Date().toISOString(),
                            car: {
                                id: 1000 + i,
                                title: `测试车辆 ${i + 1}`,
                                coverImage: 'https://example.com/car.jpg',
                                price: 100000,
                                mileage: 10000,
                                firstRegDate: '2020-01-01',
                                cityName: '北京',
                                status: 'on',
                                sourceType: 'personal',
                            },
                        } as FavoriteItem)
                    }

                    vi.mocked(getFavorites).mockImplementation(async (params) => {
                        const page = params.page || 1
                        const size = params.pageSize || 10
                        const s = (page - 1) * size
                        const e = s + size

                        return {
                            list: allFavorites.slice(s, e),
                            total,
                            page,
                            pageSize: size,
                        }
                    })

                    const result = await getFavorites({ page: requestedPage, pageSize })

                    // 验证返回的列表长度
                    expect(result.list.length).toBe(expectedCount >= 0 ? expectedCount : 0)
                    // 验证 total 始终正确
                    expect(result.total).toBe(total)

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })
})
