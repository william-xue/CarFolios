import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { storage } from '@/utils/storage'
import * as authApi from '@/api/auth'

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const useUserStore = defineStore('user', () => {
    const token = ref<string | null>(storage.get<string>(TOKEN_KEY))
    const user = ref<UserInfo | null>(storage.get<UserInfo>(USER_KEY))
    const isLoggedIn = computed(() => !!token.value && !!user.value)

    async function fetchUserInfo() {
        try {
            const userInfo = await authApi.getCurrentUser()
            user.value = userInfo
            storage.set(USER_KEY, userInfo)
            return userInfo
        } catch {
            logout()
            return null
        }
    }

    async function login(mobile: string, code: string) {
        const result = await authApi.userLogin(mobile, code)
        token.value = result.access_token
        user.value = result.user
        storage.set(TOKEN_KEY, result.access_token)
        storage.set(USER_KEY, result.user)
        return result.user
    }

    function logout() {
        token.value = null
        user.value = null
        storage.remove(TOKEN_KEY)
        storage.remove(USER_KEY)
    }

    async function sendCode(mobile: string) {
        return authApi.sendCode(mobile)
    }

    return {
        token,
        user,
        isLoggedIn,
        fetchUserInfo,
        login,
        logout,
        sendCode,
    }
})
