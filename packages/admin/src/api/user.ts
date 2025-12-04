import request from './request'
import type { PlatformUser, PageResult } from '@/types'

export interface UserListParams {
    page?: number
    pageSize?: number
    keyword?: string
    authStatus?: string
    status?: number
}

// 获取用户列表
export function getUsers(params: UserListParams): Promise<PageResult<PlatformUser>> {
    return request.get('/users', { params })
}

// 获取用户详情
export function getUserDetail(id: number): Promise<PlatformUser> {
    return request.get(`/users/${id}`)
}

// 审核用户认证
export function verifyUserAuth(id: number, data: { status: 'verified' | 'rejected'; reason?: string }) {
    return request.patch(`/users/${id}/verify`, data)
}

// 启用/禁用用户
export function updateUserStatus(id: number, status: number) {
    return request.patch(`/users/${id}/status`, { status })
}
