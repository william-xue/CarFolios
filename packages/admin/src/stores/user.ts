import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser } from '@/types'
import { storage } from '@/utils/storage'
import * as authApi from '@/api/auth'

const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

export const useUserStore = defineStore('user', () => {
    const token = ref<string | null>(storage.get<string>(TOKEN_KEY))
    const user = ref<AdminUser | null>(storage.get<AdminUser>(USER_KEY))

    const isLoggedIn = computed(() => !!token.value && !!user.value)
    const isAdmin = computed(() => user.value?.roles?.includes('admin') ?? false)

    async function login(username: string, password: string) {
        const result = await authApi.adminLogin(username, password)
        token.value = result.access_token
        user.value = result.user
        storage.set(TOKEN_KEY, result.access_token)
        storage.set(USER_KEY, result.user)
        return result.user
    }

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

    function logout() {
        token.value = null
        user.value = null
        storage.remove(TOKEN_KEY)
        storage.remove(USER_KEY)
    }

    return {
        token,
        user,
        isLoggedIn,
        isAdmin,
        login,
        fetchUserInfo,
        logout,
    }
})
