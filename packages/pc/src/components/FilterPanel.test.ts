/**
 * FilterPanel 组件属性测试
 * 
 * **Feature: user-engagement-features, Property 1: Filter Change Triggers Search Update**
 * **Validates: Requirements 1.2, 2.2**
 */
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import * as fc from 'fast-check'
import FilterPanel from './FilterPanel.vue'

// Mock useLocale composable
vi.mock('@/composables/useLocale', () => ({
    useLocale: () => ({
        t: (key: string) => key,
    }),
}))

// 创建组件的 stub 配置
const globalStubs = {
    'el-input': {
        template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keyup.enter="$emit(\'keyup\', $event)" />',
        props: ['modelValue', 'placeholder', 'clearable'],
    },
    'el-button': {
        template: '<button @click="$emit(\'click\')"><slot /></button>',
    },
    'el-select': {
        template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><slot /></select>',
        props: ['modelValue', 'placeholder', 'clearable', 'filterable'],
    },
    'el-option': {
        template: '<option :value="value">{{ label }}</option>',
        props: ['label', 'value'],
    },
    'el-tag': {
        template: '<span @click="$emit(\'click\')" @keydown.enter="$emit(\'keydown\', $event)"><slot /></span>',
    },
    'el-input-number': {
        template: '<input type="number" :value="modelValue" @change="$emit(\'change\', Number($event.target.value))" />',
        props: ['modelValue', 'min', 'max', 'placeholder', 'controlsPosition'],
    },
    LocationSelector: {
        template: '<div class="location-selector"></div>',
        props: ['modelValue'],
    },
    RangeSlider: {
        template: '<div class="range-slider" @click="handleClick"></div>',
        props: ['modelValue', 'min', 'max', 'step', 'unit', 'presets'],
        emits: ['update:modelValue', 'change'],
        methods: {
            handleClick() {
                // 模拟选择预设
                this.$emit('update:modelValue', [1, 5])
            },
        },
    },
}

describe('FilterPanel Property Tests', () => {
    /**
     * Property 1: Filter Change Triggers Search Update
     * 
     * *For any* filter value change (mileage range, year range, price range), 
     * the search parameters SHALL be updated to reflect the new filter values immediately.
     * 
     * **Validates: Requirements 1.2, 2.2**
     */
    it('Property 1: filter value changes should trigger search event with updated parameters', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 50 }),  // mileageMin
                fc.integer({ min: 0, max: 50 }),  // mileageMax
                fc.integer({ min: 2000, max: 2025 }),  // yearMin
                fc.integer({ min: 2000, max: 2025 }),  // yearMax
                (mileageMin, mileageMax, yearMin, yearMax) => {
                    const searchEvents: any[] = []

                    const wrapper = mount(FilterPanel, {
                        props: {
                            brands: [],
                            onSearch: (params: any) => {
                                searchEvents.push(params)
                            },
                        },
                        global: {
                            stubs: globalStubs,
                        },
                    })

                    // 获取组件实例
                    const vm = wrapper.vm as any

                    // 模拟里程区间变化
                    vm.handleMileageChange([mileageMin, mileageMax])

                    // 验证搜索事件被触发且包含正确的里程参数
                    expect(searchEvents.length).toBeGreaterThan(0)
                    const lastMileageEvent = searchEvents[searchEvents.length - 1]
                    expect(lastMileageEvent.mileageMin).toBe(mileageMin)
                    expect(lastMileageEvent.mileageMax).toBe(mileageMax)

                    // 模拟年份区间变化
                    vm.handleYearChange([yearMin, yearMax])

                    // 验证搜索事件被触发且包含正确的年份参数
                    expect(searchEvents.length).toBeGreaterThan(1)
                    const lastYearEvent = searchEvents[searchEvents.length - 1]
                    expect(lastYearEvent.yearMin).toBe(yearMin)
                    expect(lastYearEvent.yearMax).toBe(yearMax)

                    wrapper.unmount()
                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：重置功能应清除所有筛选值
     */
    it('reset should clear all filter values including mileage and year', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 1, max: 10 }),
                fc.integer({ min: 2020, max: 2025 }),
                (mileage, year) => {
                    const resetEvents: any[] = []
                    const searchEvents: any[] = []

                    const wrapper = mount(FilterPanel, {
                        props: {
                            brands: [],
                            onSearch: (params: any) => searchEvents.push(params),
                            onReset: () => resetEvents.push(true),
                        },
                        global: {
                            stubs: globalStubs,
                        },
                    })

                    const vm = wrapper.vm as any

                    // 设置一些筛选值
                    vm.mileageRange = [mileage, mileage + 5]
                    vm.yearRange = [year, year + 1]
                    vm.keyword = 'test'

                    // 调用重置
                    vm.handleReset()

                    // 验证所有值被清除
                    expect(vm.mileageRange).toEqual([null, null])
                    expect(vm.yearRange).toEqual([null, null])
                    expect(vm.keyword).toBe('')
                    expect(resetEvents.length).toBe(1)

                    wrapper.unmount()
                    return true
                }
            ),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：搜索参数应包含所有筛选字段
     */
    it('search event should include all filter parameters', () => {
        const searchEvents: any[] = []

        const wrapper = mount(FilterPanel, {
            props: {
                brands: [],
                onSearch: (params: any) => searchEvents.push(params),
            },
            global: {
                stubs: globalStubs,
            },
        })

        const vm = wrapper.vm as any
        vm.handleSearch()

        expect(searchEvents.length).toBe(1)
        const params = searchEvents[0]

        // 验证所有必需的筛选参数都存在
        expect(params).toHaveProperty('keyword')
        expect(params).toHaveProperty('brandId')
        expect(params).toHaveProperty('priceMin')
        expect(params).toHaveProperty('priceMax')
        expect(params).toHaveProperty('mileageMin')
        expect(params).toHaveProperty('mileageMax')
        expect(params).toHaveProperty('yearMin')
        expect(params).toHaveProperty('yearMax')
        expect(params).toHaveProperty('provinceCode')
        expect(params).toHaveProperty('cityCode')
        expect(params).toHaveProperty('districtCode')

        wrapper.unmount()
    })
})
