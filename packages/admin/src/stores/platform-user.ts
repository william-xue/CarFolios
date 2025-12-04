import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PlatformUser, UserFilters, PageParams } from '@/types'
import { mockGetUsers, mockGetUserDetail, mockUpdateUserStatus, mockUpdateUserAuth } from '@/mock'

export const usePlatformUserStore = defineStore('platformUser', () => {
    const users = ref<PlatformUser[]>([])
    const currentUser = ref<PlatformUser | null>(null)
    const total = ref(0)
    const loading = ref(false)

    async function fetchUsers(params: UserFilters & PageParams) {
        loading.value = true
        try {
            const res = await mockGetUsers(params)
            users.value = res.list
            total.value = res.total
            return res
        } finally {
            loading.value = false
        }
    }

    async function fetchUserDetail(id: number) {
        loading.value = true
        try {
            currentUser.value = await mockGetUserDetail(id)
            return currentUser.value
        } finally {
            loading.value = false
        }
    }

    async function updateUserStatus(id: number, status: PlatformUser['status']) {
        await mockUpdateUserStatus(id, status)
    }

    async function updateUserAuth(id: number, authStatus: PlatformUser['authStatus']) {
        await mockUpdateUserAuth(id, authStatus)
    }

    return {
        users,
        currentUser,
        total,
        loading,
        fetchUsers,
        fetchUserDetail,
        updateUserStatus,
        updateUserAuth,
    }
})
