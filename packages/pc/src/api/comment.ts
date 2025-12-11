import { get, post, del } from './request'
import type { PageParams, PageResult } from '@/types'

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

// 评论数量结果
export interface CommentCountResult {
    count: number
}

// 创建评论参数
export interface CreateCommentParams {
    content: string
    parentId?: number
}

/**
 * 获取车辆评论列表
 * @param carId 车辆ID
 * @param params 分页参数
 * @returns 评论列表分页结果
 * Requirements: 5.1, 5.7
 */
export function getComments(carId: number, params: PageParams): Promise<PageResult<CommentItem>> {
    return get(`/comments/car/${carId}`, { params })
}

/**
 * 添加评论
 * @param carId 车辆ID
 * @param data 评论内容
 * @returns 创建的评论
 * Requirements: 5.1
 */
export function addComment(carId: number, data: CreateCommentParams): Promise<CommentItem> {
    return post(`/comments/car/${carId}`, data)
}

/**
 * 删除评论
 * @param commentId 评论ID
 * Requirements: 5.8
 */
export function deleteComment(commentId: number): Promise<void> {
    return del(`/comments/${commentId}`)
}

/**
 * 获取车辆评论数量
 * @param carId 车辆ID
 * @returns 评论数量
 */
export function getCommentCount(carId: number): Promise<CommentCountResult> {
    return get(`/comments/car/${carId}/count`)
}
