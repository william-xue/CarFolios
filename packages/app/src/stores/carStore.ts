import { create } from 'zustand'
import type { Car, CarQueryParams } from '../types'
import { carApi } from '../api'

interface CarState {
    cars: Car[]
    loading: boolean
    hasMore: boolean
    page: number
    pageSize: number
    filters: CarQueryParams

    // 搜索相关
    searchResults: Car[]
    searchLoading: boolean
    searchTotal: number

    // Actions
    fetchCars: (params?: CarQueryParams) => Promise<void>
    refreshCars: () => Promise<void>
    loadMoreCars: () => Promise<void>
    setFilters: (filters: Partial<CarQueryParams>) => void
    resetFilters: () => void
    searchCars: (params: CarQueryParams, isRefresh?: boolean) => Promise<void>
    clearSearch: () => void
}

const defaultFilters: CarQueryParams = {
    page: 1,
    pageSize: 10,
}

export const useCarStore = create<CarState>((set, get) => ({
    cars: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    filters: { ...defaultFilters },

    // 搜索相关
    searchResults: [],
    searchLoading: false,
    searchTotal: 0,

    fetchCars: async (params?: CarQueryParams) => {
        const { filters, pageSize } = get()
        const queryParams = { ...filters, ...params, pageSize }

        set({ loading: true })
        try {
            const result = await carApi.getCars(queryParams)
            const page = queryParams.page || 1

            set({
                cars: page === 1 ? result.list : [...get().cars, ...result.list],
                hasMore: result.list.length >= pageSize,
                page,
                loading: false,
            })
        } catch (error) {
            set({ loading: false })
            throw error
        }
    },

    refreshCars: async () => {
        const { filters } = get()
        set({ cars: [], page: 1, hasMore: true })
        await get().fetchCars({ ...filters, page: 1 })
    },

    loadMoreCars: async () => {
        const { hasMore, loading, page, filters } = get()
        if (!hasMore || loading) return

        await get().fetchCars({ ...filters, page: page + 1 })
    },

    setFilters: (newFilters) => {
        set((state) => ({
            filters: { ...state.filters, ...newFilters },
        }))
    },

    resetFilters: () => {
        set({ filters: { ...defaultFilters } })
    },

    searchCars: async (params: CarQueryParams, isRefresh = false) => {
        set({ searchLoading: true })
        try {
            const result = await carApi.getCars(params)
            set({
                searchResults: isRefresh ? result.list : [...get().searchResults, ...result.list],
                searchTotal: result.total || result.list.length,
                searchLoading: false,
            })
        } catch (error) {
            set({ searchLoading: false })
            throw error
        }
    },

    clearSearch: () => {
        set({ searchResults: [], searchTotal: 0 })
    },
}))
