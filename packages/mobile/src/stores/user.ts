import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types'
import { mockGetUserInfo, mockLogin, mockLogout } from '@/mock'

export const useUserStore = defineStore('user', () => {
    const user = ref<UserInfo | null>(null)
    const isLoggedIn = computed(() => !!user.value)

    async function fetchUserInfo() {
        user.value = await mockGetUserInfo()
        return user.value
    }

    async function login(mobile: string, code: string) {
        user.value = await mockLogin(mobile, code)
        return user.value
    }

    async function logout() {
        await mockLogout()
        user.value = null
    }

    return {
        user,
        isLoggedIn,
        fetchUserInfo,
        login,
        logout,
    }
})
