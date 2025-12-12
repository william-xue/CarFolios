import { create } from 'zustand'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { User } from '../types'
import { authApi, setToken, clearToken } from '../api'

const USER_KEY = '@user_info'

interface UserState {
    user: User | null
    token: string | null
    isLoggedIn: boolean
    loading: boolean

    // Actions
    login: (mobile: string, code: string) => Promise<void>
    logout: () => Promise<void>
    fetchProfile: () => Promise<void>
    restoreSession: () => Promise<void>
    setUser: (user: User | null) => void
}

export const useUserStore = create<UserState>((set, get) => ({
    user: null,
    token: null,
    isLoggedIn: false,
    loading: false,

    login: async (mobile: string, code: string) => {
        set({ loading: true })
        try {
            const result = await authApi.login({ mobile, code })
            await setToken(result.token)
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(result.user))
            set({
                user: result.user,
                token: result.token,
                isLoggedIn: true,
                loading: false,
            })
        } catch (error) {
            set({ loading: false })
            throw error
        }
    },

    logout: async () => {
        try {
            await authApi.logout()
        } catch {
            // 忽略登出 API 错误
        }
        await clearToken()
        await AsyncStorage.removeItem(USER_KEY)
        set({
            user: null,
            token: null,
            isLoggedIn: false,
        })
    },

    fetchProfile: async () => {
        try {
            const user = await authApi.getProfile()
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(user))
            set({ user })
        } catch (error) {
            // 如果获取失败，可能是 token 过期
            await get().logout()
            throw error
        }
    },

    restoreSession: async () => {
        try {
            const [tokenStr, userStr] = await Promise.all([
                AsyncStorage.getItem('@auth_token'),
                AsyncStorage.getItem(USER_KEY),
            ])

            if (tokenStr && userStr) {
                const user = JSON.parse(userStr) as User
                set({
                    token: tokenStr,
                    user,
                    isLoggedIn: true,
                })
            }
        } catch {
            // 恢复失败，保持未登录状态
        }
    },

    setUser: (user) => {
        set({ user })
    },
}))
