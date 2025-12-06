import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { login as loginApi, sendVerifyCode as sendCodeApi, getUserInfo } from '@/api/auth'

const TOKEN_KEY = 'carfolios_token'
const USER_KEY = 'carfolios_user'

export const useUserStore = defineStore('user', () => {
    const user = ref<UserInfo | null>(null)
    const token = ref<string | null>(null)

    const isLoggedIn = computed(() => !!token.value)

    // 发送验证码
    async function sendVerifyCode(mobile: string) {
        await sendCodeApi(mobile)
    }

    // 登录
    async function login(mobile: string, code: string) {
        const res = await loginApi(mobile, code)
        token.value = res.token
        user.value = res.user

        // 持久化存储
        localStorage.setItem(TOKEN_KEY, res.token)
        localStorage.setItem(USER_KEY, JSON.stringify(res.user))
    }

    // 登出
    function logout() {
        token.value = null
        user.value = null
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    }

    // 恢复会话
    function restoreSession() {
        const savedToken = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)

        if (savedToken && savedUser) {
            token.value = savedToken
            try {
                user.value = JSON.parse(savedUser)
            } catch {
                logout()
            }
        }
    }

    // 获取用户信息
    async function fetchUserInfo() {
        if (!token.value) return null
        const userInfo = await getUserInfo()
        user.value = userInfo
        localStorage.setItem(USER_KEY, JSON.stringify(userInfo))
        return userInfo
    }

    return {
        user,
        token,
        isLoggedIn,
        sendVerifyCode,
        login,
        logout,
        restoreSession,
        fetchUserInfo,
    }
})
