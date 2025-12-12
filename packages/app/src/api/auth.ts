import { get, post } from './request'
import type { User, LoginParams } from '../types'

// 发送验证码
export function sendCode(mobile: string) {
    return post<{ success: boolean }>('/auth/send-code', { mobile })
}

// 登录
export function login(params: LoginParams) {
    return post<{ token: string; user: User }>('/auth/login', params)
}

// 获取当前用户信息
export function getProfile() {
    return get<User>('/auth/profile')
}

// 退出登录
export function logout() {
    return post<{ success: boolean }>('/auth/logout')
}
