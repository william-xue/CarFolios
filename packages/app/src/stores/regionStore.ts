import { create } from 'zustand'
import type { Region, RegionSelection } from '../types'
import { regionApi } from '../api'

interface RegionState {
    provinces: Region[]
    cities: Region[]
    districts: Region[]
    loading: boolean
    selection: RegionSelection

    // Actions
    fetchProvinces: () => Promise<void>
    fetchCities: (provinceId: number) => Promise<Region[]>
    fetchDistricts: (cityId: number) => Promise<void>
    setSelection: (selection: Partial<RegionSelection>) => void
    clearSelection: () => void
    clearCities: () => void
    clearDistricts: () => void
}

export const useRegionStore = create<RegionState>((set, get) => ({
    provinces: [],
    cities: [],
    districts: [],
    loading: false,
    selection: {},

    fetchProvinces: async () => {
        if (get().provinces.length > 0) return

        set({ loading: true })
        try {
            const provinces = await regionApi.getProvinces()
            set({ provinces, loading: false })
        } catch (error) {
            set({ loading: false })
            throw error
        }
    },

    fetchCities: async (provinceId: number) => {
        set({ loading: true, cities: [], districts: [] })
        try {
            const cities = await regionApi.getCities(provinceId)
            set({ cities, loading: false })
            return cities
        } catch (error) {
            set({ loading: false })
            throw error
        }
    },

    fetchDistricts: async (cityId: number) => {
        set({ loading: true, districts: [] })
        try {
            const districts = await regionApi.getDistricts(cityId)
            set({ districts, loading: false })
        } catch (error) {
            set({ loading: false })
            throw error
        }
    },

    setSelection: (newSelection) => {
        set((state) => ({
            selection: { ...state.selection, ...newSelection },
        }))
    },

    clearSelection: () => {
        set({ selection: {}, cities: [], districts: [] })
    },

    clearCities: () => {
        set({ cities: [], districts: [] })
    },

    clearDistricts: () => {
        set({ districts: [] })
    },
}))
