import request from './request'
import type { AdminUser } from '@/types'

export interface LoginResult {
    access_token: string
    user: AdminUser
}

// 管理员登录
export function adminLogin(username: string, password: string): Promise<LoginResult> {
    return request.post('/auth/admin/login', { username, password })
}

// 获取当前用户信息
export function getCurrentUser(): Promise<AdminUser> {
    return request.get('/auth/me')
}
