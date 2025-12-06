import type { UserInfo } from '@/types'
import { get, post } from './request'

interface LoginResponse {
    access_token: string
    user: UserInfo
}

// 发送验证码
export function sendVerifyCode(mobile: string): Promise<void> {
    return post('/auth/send-code', { mobile })
}

// 登录
export function login(mobile: string, code: string): Promise<LoginResponse> {
    return post('/auth/user/login', { mobile, code })
}

// 获取用户信息
export function getUserInfo(): Promise<UserInfo> {
    return get('/user/profile')
}
