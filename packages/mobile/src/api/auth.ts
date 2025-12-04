import request from './request'
import type { UserInfo } from '@/types'

export interface LoginResult {
    access_token: string
    user: UserInfo
}

// 发送验证码
export function sendCode(mobile: string) {
    return request.post('/auth/send-code', { mobile })
}

// 用户登录
export function userLogin(mobile: string, code: string): Promise<LoginResult> {
    return request.post('/auth/user/login', { mobile, code })
}

// 获取当前用户信息
export function getCurrentUser(): Promise<UserInfo> {
    return request.get('/auth/me')
}

// 提交实名认证
export function submitAuth(data: { realName: string; idCard: string }) {
    return request.post('/users/auth/submit', data)
}
