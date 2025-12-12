import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
    formatPriceForPoster,
    formatMileageForPoster,
    generatePosterFilename,
    generateCarDetailUrl
} from './posterUtils'

describe('posterUtils', () => {
    describe('formatPriceForPoster', () => {
        it('应该正确格式化价格', () => {
            expect(formatPriceForPoster(21)).toBe('¥21.00万')
            expect(formatPriceForPoster(8.5)).toBe('¥8.50万')
            expect(formatPriceForPoster(0)).toBe('¥0.00万')
        })

        // Property 1: Poster Content Completeness - 价格格式化
        it('PBT: 任意有效数字都应返回包含 ¥ 和 万 的格式化字符串', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 0, max: 10000, noNaN: true }),
                    (price) => {
                        const result = formatPriceForPoster(price)
                        return result.startsWith('¥') && result.endsWith('万')
                    }
                )
            )
        })

        it('PBT: 无效输入应返回默认值', () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(NaN),
                        fc.constant(undefined as unknown as number),
                        fc.constant(null as unknown as number),
                        fc.constant('abc' as unknown as number)
                    ),
                    (invalidInput) => {
                        const result = formatPriceForPoster(invalidInput)
                        return result === '¥0.00万'
                    }
                )
            )
        })
    })

    describe('formatMileageForPoster', () => {
        it('应该正确格式化里程', () => {
            expect(formatMileageForPoster(8)).toBe('8.0万公里')
            expect(formatMileageForPoster(3.5)).toBe('3.5万公里')
            expect(formatMileageForPoster(0)).toBe('0.0万公里')
        })

        // Property 1: Poster Content Completeness - 里程格式化
        it('PBT: 任意有效数字都应返回包含 万公里 的格式化字符串', () => {
            fc.assert(
                fc.property(
                    fc.float({ min: 0, max: 1000, noNaN: true }),
                    (mileage) => {
                        const result = formatMileageForPoster(mileage)
                        return result.endsWith('万公里')
                    }
                )
            )
        })
    })

    describe('generatePosterFilename', () => {
        it('应该生成正确的文件名', () => {
            expect(generatePosterFilename('宝马3系')).toBe('宝马3系_海报.png')
            expect(generatePosterFilename('奔驰 E300')).toBe('奔驰_E300_海报.png')
        })

        // Property 4: Filename Generation
        it('PBT: 任意字符串都应生成以 .png 结尾的文件名', () => {
            fc.assert(
                fc.property(fc.string(), (title) => {
                    const result = generatePosterFilename(title)
                    return result.endsWith('.png')
                })
            )
        })

        it('PBT: 生成的文件名不应包含非法字符', () => {
            fc.assert(
                fc.property(fc.string(), (title) => {
                    const result = generatePosterFilename(title)
                    // 检查不包含文件名非法字符
                    return !/[\\/:*?"<>|]/.test(result)
                })
            )
        })

        it('PBT: 空或无效输入应返回默认文件名', () => {
            fc.assert(
                fc.property(
                    fc.oneof(
                        fc.constant(''),
                        fc.constant(null as unknown as string),
                        fc.constant(undefined as unknown as string)
                    ),
                    (invalidInput) => {
                        const result = generatePosterFilename(invalidInput)
                        return result === '车辆海报.png'
                    }
                )
            )
        })
    })

    describe('generateCarDetailUrl', () => {
        it('应该生成正确的 URL', () => {
            expect(generateCarDetailUrl(123, 'https://example.com')).toBe(
                'https://example.com/car/123'
            )
        })

        // Property 2: QR Code URL Correctness
        it('PBT: 任意车辆 ID 都应生成包含 /car/{id} 的 URL', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 1000000 }),
                    fc.webUrl(),
                    (carId, baseUrl) => {
                        const result = generateCarDetailUrl(carId, baseUrl)
                        return result.includes(`/car/${carId}`)
                    }
                )
            )
        })

        it('PBT: 生成的 URL 应以 baseUrl 开头', () => {
            fc.assert(
                fc.property(
                    fc.integer({ min: 1, max: 1000000 }),
                    fc.webUrl(),
                    (carId, baseUrl) => {
                        const result = generateCarDetailUrl(carId, baseUrl)
                        return result.startsWith(baseUrl)
                    }
                )
            )
        })
    })
})
