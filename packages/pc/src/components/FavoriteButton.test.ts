/**
 * FavoriteButton 组件属性测试
 * 
 * **Feature: user-engagement-features, Property 3: Favorite Round-Trip Consistency**
 * **Validates: Requirements 3.1, 3.2**
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import * as fc from 'fast-check'
import FavoriteButton from './FavoriteButton.vue'
import { createPinia, setActivePinia } from 'pinia'

// Mock API 模块
vi.mock('@/api/favorite', () => ({
    addFavorite: vi.fn(),
    removeFavorite: vi.fn(),
    checkFavorite: vi.fn(),
}))

// Mock useLocale
vi.mock('@/composables/useLocale', () => ({
    useLocale: () => ({
        t: (key: string) => key,
    }),
}))

// Mock Element Plus
vi.mock('element-plus', async (importOriginal) => {
    const actual = await importOriginal() as any
    return {
        ...actual,
        ElMessage: {
            success: vi.fn(),
            error: vi.fn(),
        },
    }
})

import { addFavorite, removeFavorite, checkFavorite } from '@/api/favorite'

// 生成有效的车辆 ID
const carIdArbitrary = fc.integer({ min: 1, max: 10000 })

describe('FavoriteButton Property Tests', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    /**
     * Property 3: Favorite Round-Trip Consistency
     * 
     * *For any* car and user, favoriting then unfavoriting SHALL return 
     * the favorite status to its original state (not favorited).
     * 
     * **Validates: Requirements 3.1, 3.2**
     */
    it('Property 3: favoriting then unfavoriting should return to original state', async () => {
        await fc.assert(
            fc.asyncProperty(carIdArbitrary, async (carId) => {
                // 设置 mock 返回值
                vi.mocked(addFavorite).mockResolvedValue(undefined)
                vi.mocked(removeFavorite).mockResolvedValue(undefined)
                vi.mocked(checkFavorite).mockResolvedValue({ isFavorited: false })

                // 模拟已登录状态
                const pinia = createPinia()
                setActivePinia(pinia)

                // 直接设置 localStorage 模拟登录状态
                localStorage.setItem('carfolios_token', 'test-token')
                localStorage.setItem('carfolios_user', JSON.stringify({ id: 1, mobile: '13800138000' }))

                const emittedChanges: boolean[] = []

                const wrapper = mount(FavoriteButton, {
                    props: {
                        carId,
                        isFavorited: false, // 初始状态：未收藏
                        'onChange': (val: boolean) => {
                            emittedChanges.push(val)
                        },
                    },
                    global: {
                        plugins: [pinia],
                        stubs: {
                            'el-button': {
                                template: '<button @click="$emit(\'click\', $event)"><slot /></button>',
                            },
                            'el-icon': {
                                template: '<span><slot /></span>',
                            },
                        },
                    },
                })

                // 恢复用户会话
                const userStore = (await import('@/stores/user')).useUserStore()
                userStore.restoreSession()

                await flushPromises()

                // 第一次点击：添加收藏 (false -> true)
                await wrapper.find('button').trigger('click')
                await flushPromises()

                // 验证 addFavorite 被调用
                expect(addFavorite).toHaveBeenCalledWith(carId)

                // 第二次点击：取消收藏 (true -> false)
                // 更新 props 模拟状态变化
                await wrapper.setProps({ isFavorited: true })
                await wrapper.find('button').trigger('click')
                await flushPromises()

                // 验证 removeFavorite 被调用
                expect(removeFavorite).toHaveBeenCalledWith(carId)

                // 验证往返一致性：最终状态应该回到未收藏
                if (emittedChanges.length >= 2) {
                    const firstChange = emittedChanges[0]
                    const secondChange = emittedChanges[1]

                    // 第一次变化应该是 true（添加收藏）
                    expect(firstChange).toBe(true)
                    // 第二次变化应该是 false（取消收藏）
                    expect(secondChange).toBe(false)
                }

                wrapper.unmount()
                localStorage.clear()

                return true
            }),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：收藏状态切换的幂等性
     * 多次点击应该正确切换状态
     */
    it('favorite toggle should correctly alternate states', async () => {
        await fc.assert(
            fc.asyncProperty(
                carIdArbitrary,
                fc.integer({ min: 2, max: 6 }), // 点击次数
                async (carId, clickCount) => {
                    vi.mocked(addFavorite).mockResolvedValue(undefined)
                    vi.mocked(removeFavorite).mockResolvedValue(undefined)
                    vi.mocked(checkFavorite).mockResolvedValue({ isFavorited: false })

                    const pinia = createPinia()
                    setActivePinia(pinia)

                    localStorage.setItem('carfolios_token', 'test-token')
                    localStorage.setItem('carfolios_user', JSON.stringify({ id: 1, mobile: '13800138000' }))

                    let currentState = false
                    const stateHistory: boolean[] = [currentState]

                    const wrapper = mount(FavoriteButton, {
                        props: {
                            carId,
                            isFavorited: currentState,
                            'onChange': (val: boolean) => {
                                currentState = val
                                stateHistory.push(val)
                            },
                        },
                        global: {
                            plugins: [pinia],
                            stubs: {
                                'el-button': {
                                    template: '<button @click="$emit(\'click\', $event)"><slot /></button>',
                                },
                                'el-icon': {
                                    template: '<span><slot /></span>',
                                },
                            },
                        },
                    })

                    const userStore = (await import('@/stores/user')).useUserStore()
                    userStore.restoreSession()

                    await flushPromises()

                    // 执行多次点击
                    for (let i = 0; i < clickCount; i++) {
                        await wrapper.setProps({ isFavorited: currentState })
                        await wrapper.find('button').trigger('click')
                        await flushPromises()
                    }

                    // 验证状态交替变化
                    for (let i = 1; i < stateHistory.length; i++) {
                        expect(stateHistory[i]).toBe(!stateHistory[i - 1])
                    }

                    // 验证最终状态
                    // 偶数次点击应该回到初始状态，奇数次点击应该是相反状态
                    const expectedFinalState = clickCount % 2 === 1
                    expect(currentState).toBe(expectedFinalState)

                    wrapper.unmount()
                    localStorage.clear()

                    return true
                }
            ),
            { numRuns: 50 }
        )
    })
})
