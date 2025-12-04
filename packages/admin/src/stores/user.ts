import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser } from '@/types'
import { getToken, setToken, removeToken, storage } from '@/utils/storage'
import { mockLogin } from '@/mock'

const USER_KEY = 'user'

export const useUserStore = defineStore('user', () => {
    const token = ref<string | null>(getToken())
    const user = ref<AdminUser | null>(storage.get<AdminUser>(USER_KEY))

    const isLoggedIn = computed(() => !!token.value && !!user.value)
    const isAdmin = computed(() => user.value?.roles.includes('admin') ?? false)

    async function login(username: string, password: string) {
        const result = await mockLogin(username, password)
        token.value = result.token
        user.value = result.user
        setToken(result.token)
        storage.set(USER_KEY, result.user)
    }

    function logout() {
        token.value = null
        user.value = null
        removeToken()
        storage.remove(USER_KEY)
    }

    return {
        token,
        user,
        isLoggedIn,
        isAdmin,
        login,
        logout,
    }
})
