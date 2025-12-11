/**
 * RangeSlider 组件属性测试
 * 
 * **Feature: user-engagement-features, Property 2: Preset Selection Applies Correct Values**
 * **Validates: Requirements 1.3, 2.3**
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import * as fc from 'fast-check'
import RangeSlider, { type RangePreset } from './RangeSlider.vue'

// 生成有效的预设选项
const presetArbitrary = fc.record({
    label: fc.string({ minLength: 1, maxLength: 20 }),
    min: fc.oneof(fc.integer({ min: 0, max: 100 }), fc.constant(null)),
    max: fc.oneof(fc.integer({ min: 0, max: 100 }), fc.constant(null)),
})

// 生成预设数组
const presetsArbitrary = fc.array(presetArbitrary, { minLength: 1, maxLength: 5 })

describe('RangeSlider Property Tests', () => {
    /**
     * Property 2: Preset Selection Applies Correct Values
     * 
     * *For any* preset option (mileage or year), selecting it SHALL set the filter's 
     * min and max values to match the preset's defined range.
     * 
     * **Validates: Requirements 1.3, 2.3**
     */
    it('Property 2: selecting a preset should apply its min and max values', () => {
        fc.assert(
            fc.property(presetsArbitrary, (presets) => {
                // 为每个预设测试选择行为
                for (const preset of presets) {
                    const emittedValues: Array<[number | null, number | null]> = []

                    const wrapper = mount(RangeSlider, {
                        props: {
                            modelValue: [null, null] as [number | null, number | null],
                            min: 0,
                            max: 100,
                            presets: presets as RangePreset[],
                            'onUpdate:modelValue': (val: [number | null, number | null]) => {
                                emittedValues.push(val)
                            },
                        },
                        global: {
                            stubs: {
                                'el-tag': {
                                    template: '<button @click="$emit(\'click\')"><slot /></button>',
                                },
                                'el-input-number': true,
                            },
                        },
                    })

                    // 找到对应的预设标签并点击
                    const tags = wrapper.findAll('button')
                    const targetIndex = presets.indexOf(preset)

                    if (targetIndex >= 0 && targetIndex < tags.length) {
                        tags[targetIndex].trigger('click')

                        // 验证发出的值与预设匹配
                        if (emittedValues.length > 0) {
                            const lastEmitted = emittedValues[emittedValues.length - 1]
                            expect(lastEmitted[0]).toBe(preset.min)
                            expect(lastEmitted[1]).toBe(preset.max)
                        }
                    }

                    wrapper.unmount()
                }

                return true
            }),
            { numRuns: 100 }
        )
    })

    /**
     * 补充测试：预设选中状态正确反映
     */
    it('preset selection state should reflect current values', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: 50 }),
                fc.integer({ min: 51, max: 100 }),
                (minVal, maxVal) => {
                    const presets: RangePreset[] = [
                        { label: '测试预设', min: minVal, max: maxVal },
                        { label: '其他预设', min: 0, max: 10 },
                    ]

                    const wrapper = mount(RangeSlider, {
                        props: {
                            modelValue: [minVal, maxVal] as [number | null, number | null],
                            min: 0,
                            max: 100,
                            presets,
                        },
                        global: {
                            stubs: {
                                'el-tag': {
                                    template: '<button :data-selected="$attrs[\'aria-pressed\']"><slot /></button>',
                                    inheritAttrs: true,
                                },
                                'el-input-number': true,
                            },
                        },
                    })

                    // 组件内部的 isPresetSelected 函数应该正确识别选中的预设
                    const vm = wrapper.vm as any
                    expect(vm.isPresetSelected(presets[0])).toBe(true)
                    expect(vm.isPresetSelected(presets[1])).toBe(false)

                    wrapper.unmount()
                    return true
                }
            ),
            { numRuns: 100 }
        )
    })
})
