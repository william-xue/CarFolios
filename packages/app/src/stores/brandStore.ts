import { create } from 'zustand'
import type { Brand, Series } from '../types'
import { brandApi } from '../api'

interface BrandState {
    brands: Brand[]
    series: Series[]
    loading: boolean
    seriesLoading: boolean
    selectedBrandId: number | null

    // Actions
    fetchBrands: () => Promise<void>
    fetchSeries: (brandId: number) => Promise<void>
    setSelectedBrand: (brandId: number | null) => void
    clearSeries: () => void
}

export const useBrandStore = create<BrandState>((set, get) => ({
    brands: [],
    series: [],
    loading: false,
    seriesLoading: false,
    selectedBrandId: null,

    fetchBrands: async () => {
        if (get().brands.length > 0) return // 已有数据则不重复请求

        set({ loading: true })
        try {
            const brands = await brandApi.getBrands()
            set({ brands, loading: false })
        } catch (error) {
            set({ loading: false })
            throw error
        }
    },

    fetchSeries: async (brandId: number) => {
        set({ seriesLoading: true, selectedBrandId: brandId })
        try {
            const series = await brandApi.getSeries(brandId)
            set({ series, seriesLoading: false })
        } catch (error) {
            set({ seriesLoading: false })
            throw error
        }
    },

    setSelectedBrand: (brandId) => {
        set({ selectedBrandId: brandId })
        if (brandId) {
            get().fetchSeries(brandId)
        } else {
            get().clearSeries()
        }
    },

    clearSeries: () => {
        set({ series: [], selectedBrandId: null })
    },
}))
