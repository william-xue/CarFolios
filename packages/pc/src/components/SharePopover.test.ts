/**
 * SharePopover 组件属性测试
 * 
 * **Feature: user-engagement-features, Property 5: Share Content Completeness**
 * **Validates: Requirements 4.4**
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import * as fc from 'fast-check'
import SharePopover from './SharePopover.vue'

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
            info: vi.fn(),
        },
    }
})

// Mock navigator.clipboard
const mockWriteText = vi.fn().mockResolvedValue(undefined)
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
})

// Mock window.isSecureContext to ensure clipboard API is used
Object.defineProperty(window, 'isSecureContext', {
    value: true,
    writable: true,
    configurable: true,
})

// Mock window.open
const mockWindowOpen = vi.fn()
Object.defineProperty(window, 'open', {
    value: mockWindowOpen,
    writable: true,
    configurable: true,
})

// 生成有效的车辆标题
const titleArbitrary = fc.string({ minLength: 1, maxLength: 100 })
    .filter(s => s.trim().length > 0)

// 生成有效的图片 URL
const imageUrlArbitrary = fc.constantFrom(
    'https://example.com/car1.jpg',
    'https://example.com/car2.jpg',
    'https://cdn.carfolios.com/images/car.png',
    ''
)

// 生成有效的描述
const descriptionArbitrary = fc.string({ minLength: 0, maxLength: 200 })

// 生成有效的 URL
const urlArbitrary = fc.constantFrom(
    'https://carfolios.com/car/1',
    'https://carfolios.com/car/123',
    'https://carfolios.com/car/999',
    'https://www.carfolios.com/detail/456'
)

describe('SharePopover Property Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockWindowOpen.mockClear()
        mockWriteText.mockClear()
    })

    /**
     * Property 5: Share Content Completeness
     * 
     * *For any* car, the generated share content SHALL include the car's title, 
     * price, cover image URL, and platform link.
     * 
     * **Validates: Requirements 4.4**
     */
    it('Property 5: share content should include title, image, description, and url', async () => {
        await fc.assert(
            fc.asyncProperty(
                titleArbitrary,
                imageUrlArbitrary,
                descriptionArbitrary,
                urlArbitrary,
                async (title, image, description, url) => {
                    const wrapper = mount(SharePopover, {
                        props: {
                            title,
                            image,
                            description,
                            url,
                        },
                        global: {
                            stubs: {
                                'el-popover': {
                                    template: '<div><slot /><slot name="reference" /></div>',
                                },
                                'el-button': {
                                    template: '<button><slot /></button>',
                                },
                                'el-icon': {
                                    template: '<span><slot /></span>',
                                },
                            },
                        },
                    })

                    // 获取组件暴露的 shareContent
                    const vm = wrapper.vm as any
                    const shareContent = vm.shareContent

                    // 验证分享内容包含所有必要字段
                    expect(shareContent).toBeDefined()
                    expect(shareContent.title).toBe(title)
                    expect(shareContent.image).toBe(image)
                    expect(shareContent.description).toBe(description)
                    expect(shareContent.url).toBe(url)

                    // 验证所有字段都不为 undefined
                    expect(shareContent.title).not.toBeUndefined()
                    expect(shareContent.url).not.toBeUndefined()

                    wrapper.unmount()
                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：微博分享 URL 应包含完整的分享信息
     */
    it('Weibo share URL should contain title, url, image, and summary', async () => {
        await fc.assert(
            fc.asyncProperty(
                titleArbitrary,
                imageUrlArbitrary,
                descriptionArbitrary,
                urlArbitrary,
                async (title, image, description, url) => {
                    const wrapper = mount(SharePopover, {
                        props: {
                            title,
                            image,
                            description,
                            url,
                        },
                        global: {
                            stubs: {
                                'el-popover': {
                                    template: '<div><slot /><slot name="reference" /></div>',
                                },
                                'el-button': {
                                    template: '<button><slot /></button>',
                                },
                                'el-icon': {
                                    template: '<span><slot /></span>',
                                },
                            },
                        },
                    })

                    // 调用微博分享
                    const vm = wrapper.vm as any
                    vm.shareToWeibo()

                    // 验证 window.open 被调用
                    expect(mockWindowOpen).toHaveBeenCalled()

                    // 获取调用参数
                    const openUrl = mockWindowOpen.mock.calls[0][0] as string

                    // 验证 URL 包含必要参数
                    expect(openUrl).toContain('service.weibo.com/share/share.php')
                    expect(openUrl).toContain(`url=${encodeURIComponent(url)}`)
                    expect(openUrl).toContain(`title=${encodeURIComponent(`【CarFolios】${title}`)}`)

                    if (image) {
                        expect(openUrl).toContain(`pic=${encodeURIComponent(image)}`)
                    }

                    if (description) {
                        expect(openUrl).toContain(`summary=${encodeURIComponent(description)}`)
                    }

                    wrapper.unmount()
                    mockWindowOpen.mockClear()
                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：QQ 分享 URL 应包含完整的分享信息
     */
    it('QQ share URL should contain title, url, summary, and pics', async () => {
        await fc.assert(
            fc.asyncProperty(
                titleArbitrary,
                imageUrlArbitrary,
                descriptionArbitrary,
                urlArbitrary,
                async (title, image, description, url) => {
                    const wrapper = mount(SharePopover, {
                        props: {
                            title,
                            image,
                            description,
                            url,
                        },
                        global: {
                            stubs: {
                                'el-popover': {
                                    template: '<div><slot /><slot name="reference" /></div>',
                                },
                                'el-button': {
                                    template: '<button><slot /></button>',
                                },
                                'el-icon': {
                                    template: '<span><slot /></span>',
                                },
                            },
                        },
                    })

                    // 调用 QQ 分享
                    const vm = wrapper.vm as any
                    vm.shareToQQ()

                    // 验证 window.open 被调用
                    expect(mockWindowOpen).toHaveBeenCalled()

                    // 获取调用参数
                    const openUrl = mockWindowOpen.mock.calls[0][0] as string

                    // 验证 URL 包含必要参数
                    expect(openUrl).toContain('connect.qq.com/widget/shareqq')
                    expect(openUrl).toContain(`url=${encodeURIComponent(url)}`)
                    expect(openUrl).toContain(`title=${encodeURIComponent(`【CarFolios】${title}`)}`)

                    // summary 使用 description 或 title
                    const expectedSummary = description || title
                    expect(openUrl).toContain(`summary=${encodeURIComponent(expectedSummary)}`)

                    if (image) {
                        expect(openUrl).toContain(`pics=${encodeURIComponent(image)}`)
                    }

                    wrapper.unmount()
                    mockWindowOpen.mockClear()
                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：复制链接应复制正确的 URL
     */
    it('Copy link should copy the correct URL to clipboard', async () => {
        await fc.assert(
            fc.asyncProperty(
                titleArbitrary,
                urlArbitrary,
                async (title, url) => {
                    const wrapper = mount(SharePopover, {
                        props: {
                            title,
                            url,
                        },
                        global: {
                            stubs: {
                                'el-popover': {
                                    template: '<div><slot /><slot name="reference" /></div>',
                                },
                                'el-button': {
                                    template: '<button><slot /></button>',
                                },
                                'el-icon': {
                                    template: '<span><slot /></span>',
                                },
                            },
                        },
                    })

                    // 调用复制链接
                    const vm = wrapper.vm as any
                    await vm.copyLink()

                    // 验证 clipboard.writeText 被调用，且参数正确
                    expect(mockWriteText).toHaveBeenCalledWith(url)

                    wrapper.unmount()
                    mockWriteText.mockClear()
                    return true
                }
            ),
            { numRuns: 100 }
        )
    })
})
