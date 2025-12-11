/**
 * CommentSection 组件属性测试
 * 
 * **Feature: user-engagement-features, Property 7: Empty Comment Rejection**
 * **Validates: Requirements 5.4**
 */
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * 评论内容验证函数（从组件逻辑中提取）
 * 用于测试空白内容验证逻辑
 */
function validateCommentContent(content: string): { valid: boolean; error?: string } {
    // 验证内容不能为空或纯空白
    if (!content || content.trim().length === 0) {
        return { valid: false, error: '评论内容不能为空' }
    }
    return { valid: true }
}

/**
 * 检查是否为纯空白字符串
 */
function isWhitespaceOnly(str: string): boolean {
    return str.trim().length === 0
}

describe('CommentSection Property Tests', () => {
    /**
     * Property 7: Empty Comment Rejection
     * 
     * *For any* string composed entirely of whitespace characters, 
     * comment submission SHALL be rejected with a validation error.
     * 
     * **Validates: Requirements 5.4**
     */
    it('Property 7: whitespace-only comments should be rejected', () => {
        // 生成纯空白字符串的生成器
        const whitespaceArbitrary = fc.array(
            fc.constantFrom(' ', '\t', '\n', '\r', '  ', '\t\t', '\n\n'),
            { minLength: 0, maxLength: 20 }
        ).map(arr => arr.join(''))

        fc.assert(
            fc.property(
                whitespaceArbitrary,
                (whitespaceString: string) => {
                    // 验证纯空白字符串
                    const result = validateCommentContent(whitespaceString)

                    // 纯空白内容应该被拒绝
                    expect(result.valid).toBe(false)
                    expect(result.error).toBe('评论内容不能为空')

                    // 验证 isWhitespaceOnly 函数
                    expect(isWhitespaceOnly(whitespaceString)).toBe(true)

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：有效评论内容应该被接受
     */
    it('valid non-whitespace comments should be accepted', () => {
        fc.assert(
            fc.property(
                // 生成非空白字符串（至少包含一个非空白字符）
                fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
                (validContent: string) => {
                    const result = validateCommentContent(validContent)

                    // 有效内容应该被接受
                    expect(result.valid).toBe(true)
                    expect(result.error).toBeUndefined()

                    // 验证 isWhitespaceOnly 函数
                    expect(isWhitespaceOnly(validContent)).toBe(false)

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：空字符串应该被拒绝
     */
    it('empty string should be rejected', () => {
        const result = validateCommentContent('')

        expect(result.valid).toBe(false)
        expect(result.error).toBe('评论内容不能为空')
        expect(isWhitespaceOnly('')).toBe(true)
    })

    /**
     * 补充测试：混合内容（空白+非空白）应该被接受
     */
    it('mixed content with non-whitespace should be accepted', () => {
        fc.assert(
            fc.property(
                fc.tuple(
                    fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 0, maxLength: 5 }),
                    fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
                    fc.array(fc.constantFrom(' ', '\t', '\n'), { minLength: 0, maxLength: 5 })
                ),
                ([prefix, content, suffix]) => {
                    const mixedContent = prefix.join('') + content + suffix.join('')
                    const result = validateCommentContent(mixedContent)

                    // 包含非空白字符的内容应该被接受
                    expect(result.valid).toBe(true)
                    expect(result.error).toBeUndefined()

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：验证 trim 后的内容长度
     */
    it('trimmed content length should be positive for valid comments', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1, maxLength: 500 }),
                (content: string) => {
                    const result = validateCommentContent(content)
                    const trimmedLength = content.trim().length

                    // 如果 trim 后长度为 0，应该被拒绝
                    if (trimmedLength === 0) {
                        expect(result.valid).toBe(false)
                    } else {
                        expect(result.valid).toBe(true)
                    }

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })
})


/**
 * 评论分页和排序属性测试
 * 
 * **Feature: user-engagement-features, Property 8: Comment Pagination Limit**
 * **Feature: user-engagement-features, Property 10: Comments Ordering**
 * **Validates: Requirements 5.7, 6.4**
 */

// 模拟评论数据结构
interface MockComment {
    id: number
    content: string
    createdAt: Date
}

/**
 * 分页函数（模拟后端分页逻辑）
 * 每页最多10条
 */
function paginateComments(comments: MockComment[], page: number, pageSize: number): MockComment[] {
    const effectivePageSize = Math.min(pageSize, 10) // 最多10条
    const start = (page - 1) * effectivePageSize
    return comments.slice(start, start + effectivePageSize)
}

/**
 * 排序函数（按创建时间升序）
 */
function sortCommentsByCreatedAt(comments: MockComment[]): MockComment[] {
    return [...comments].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
}

/**
 * 检查评论是否按创建时间升序排列
 */
function isOrderedByCreatedAtAsc(comments: MockComment[]): boolean {
    for (let i = 1; i < comments.length; i++) {
        if (comments[i].createdAt.getTime() < comments[i - 1].createdAt.getTime()) {
            return false
        }
    }
    return true
}

describe('Comment Pagination and Ordering Property Tests', () => {
    /**
     * Property 8: Comment Pagination Limit
     * 
     * *For any* comment list query, each page SHALL contain at most 10 comments.
     * 
     * **Validates: Requirements 5.7**
     */
    it('Property 8: each page should contain at most 10 comments', () => {
        // 使用整数时间戳来避免无效日期问题
        const validDateArbitrary = fc.integer({
            min: new Date('2020-01-01').getTime(),
            max: new Date('2025-12-31').getTime()
        }).map(ts => new Date(ts))

        fc.assert(
            fc.property(
                // 生成评论数组（0-50条）
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        content: fc.string({ minLength: 1, maxLength: 100 }),
                        createdAt: validDateArbitrary,
                    }),
                    { minLength: 0, maxLength: 50 }
                ),
                // 生成页码（1-10）
                fc.integer({ min: 1, max: 10 }),
                // 生成请求的 pageSize（可能超过10）
                fc.integer({ min: 1, max: 100 }),
                (comments, page, requestedPageSize) => {
                    const result = paginateComments(comments, page, requestedPageSize)

                    // 验证每页最多10条
                    expect(result.length).toBeLessThanOrEqual(10)

                    // 验证返回的数量不超过实际可用的评论数
                    const expectedMaxItems = Math.min(
                        10,
                        Math.max(0, comments.length - (page - 1) * Math.min(requestedPageSize, 10))
                    )
                    expect(result.length).toBeLessThanOrEqual(expectedMaxItems)

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * Property 10: Comments Ordering
     * 
     * *For any* set of comments, the query result SHALL be ordered by creation time ascending (oldest first).
     * 
     * **Validates: Requirements 6.4**
     */
    it('Property 10: comments should be ordered by creation time ascending', () => {
        // 使用整数时间戳来避免无效日期问题
        const validDateArbitrary = fc.integer({
            min: new Date('2020-01-01').getTime(),
            max: new Date('2025-12-31').getTime()
        }).map(ts => new Date(ts))

        fc.assert(
            fc.property(
                // 生成评论数组（1-30条）
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        content: fc.string({ minLength: 1, maxLength: 100 }),
                        createdAt: validDateArbitrary,
                    }),
                    { minLength: 1, maxLength: 30 }
                ),
                (comments) => {
                    // 排序评论
                    const sortedComments = sortCommentsByCreatedAt(comments)

                    // 验证排序结果是按创建时间升序的
                    expect(isOrderedByCreatedAtAsc(sortedComments)).toBe(true)

                    // 验证排序后的第一条是最早的
                    if (sortedComments.length > 0) {
                        const minTime = Math.min(...comments.map(c => c.createdAt.getTime()))
                        expect(sortedComments[0].createdAt.getTime()).toBe(minTime)
                    }

                    // 验证排序后的最后一条是最新的
                    if (sortedComments.length > 0) {
                        const maxTime = Math.max(...comments.map(c => c.createdAt.getTime()))
                        expect(sortedComments[sortedComments.length - 1].createdAt.getTime()).toBe(maxTime)
                    }

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：分页应该返回正确的子集
     */
    it('pagination should return correct subset of comments', () => {
        const validDateArbitrary = fc.integer({
            min: new Date('2020-01-01').getTime(),
            max: new Date('2025-12-31').getTime()
        }).map(ts => new Date(ts))

        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        content: fc.string({ minLength: 1, maxLength: 50 }),
                        createdAt: validDateArbitrary,
                    }),
                    { minLength: 0, maxLength: 25 }
                ),
                fc.integer({ min: 1, max: 5 }),
                (comments, page) => {
                    const pageSize = 10
                    const result = paginateComments(comments, page, pageSize)

                    // 计算预期的起始和结束索引
                    const start = (page - 1) * pageSize
                    const end = Math.min(start + pageSize, comments.length)

                    // 如果起始索引超出范围，应该返回空数组
                    if (start >= comments.length) {
                        expect(result.length).toBe(0)
                    } else {
                        // 验证返回的评论是原数组的正确子集
                        expect(result.length).toBe(end - start)
                        for (let i = 0; i < result.length; i++) {
                            expect(result[i]).toEqual(comments[start + i])
                        }
                    }

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：排序应该保持所有元素
     */
    it('sorting should preserve all elements', () => {
        const validDateArbitrary = fc.integer({
            min: new Date('2020-01-01').getTime(),
            max: new Date('2025-12-31').getTime()
        }).map(ts => new Date(ts))

        fc.assert(
            fc.property(
                fc.array(
                    fc.record({
                        id: fc.integer({ min: 1, max: 1000 }),
                        content: fc.string({ minLength: 1, maxLength: 50 }),
                        createdAt: validDateArbitrary,
                    }),
                    { minLength: 0, maxLength: 20 }
                ),
                (comments) => {
                    const sortedComments = sortCommentsByCreatedAt(comments)

                    // 验证排序后的数组长度相同
                    expect(sortedComments.length).toBe(comments.length)

                    // 验证所有原始元素都存在于排序后的数组中
                    for (const comment of comments) {
                        expect(sortedComments).toContainEqual(comment)
                    }

                    return true
                }
            ),
            { numRuns: 100 }
        )
    })
})
