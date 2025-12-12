import request from './request'

// 评论用户信息
export interface CommentUser {
    id: number
    nickname: string
    avatar: string | null
}

// 评论项类型
export interface CommentItem {
    id: number
    userId: number
    carId: number
    content: string
    parentId: number | null
    createdAt: string
    updatedAt: string
    user: CommentUser
    replies?: CommentItem[]
}

// 分页参数
export interface PageParams {
    page?: number
    pageSize?: number
}

// 分页结果
export interface PageResult<T> {
    list: T[]
    total: number
    page: number
    pageSize: number
}

// 创建评论参数
export interface CreateCommentParams {
    content: string
    parentId?: number
}

/**
 * 获取车辆评论列表
 */
export function getComments(carId: number, params: PageParams): Promise<PageResult<CommentItem>> {
    return request.get(`/comments/car/${carId}`, { params })
}

/**
 * 添加评论
 */
export function addComment(carId: number, data: CreateCommentParams): Promise<CommentItem> {
    return request.post(`/comments/car/${carId}`, data)
}

/**
 * 删除评论
 */
export function deleteComment(commentId: number): Promise<void> {
    return request.delete(`/comments/${commentId}`)
}

/**
 * 获取车辆评论数量
 */
export function getCommentCount(carId: number): Promise<{ count: number }> {
    return request.get(`/comments/car/${carId}/count`)
}
