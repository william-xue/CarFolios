import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { useBrandStore } from '../stores';
import type { Brand } from '../types';

// 价格区间选项
const PRICE_RANGES = [
    { label: '不限', min: undefined, max: undefined },
    { label: '5万以下', min: 0, max: 50000 },
    { label: '5-10万', min: 50000, max: 100000 },
    { label: '10-15万', min: 100000, max: 150000 },
    { label: '15-20万', min: 150000, max: 200000 },
    { label: '20-30万', min: 200000, max: 300000 },
    { label: '30-50万', min: 300000, max: 500000 },
    { label: '50万以上', min: 500000, max: undefined },
];

// 里程区间选项
const MILEAGE_RANGES = [
    { label: '不限', min: undefined, max: undefined },
    { label: '1万公里以下', min: 0, max: 10000 },
    { label: '1-3万公里', min: 10000, max: 30000 },
    { label: '3-5万公里', min: 30000, max: 50000 },
    { label: '5-8万公里', min: 50000, max: 80000 },
    { label: '8-10万公里', min: 80000, max: 100000 },
    { label: '10万公里以上', min: 100000, max: undefined },
];

export interface FilterValues {
    brandId?: number;
    brandName?: string;
    priceMin?: number;
    priceMax?: number;
    mileageMin?: number;
    mileageMax?: number;
}

interface FilterPanelProps {
    visible: boolean;
    onClose: () => void;
    onApply: (filters: FilterValues) => void;
    initialValues?: FilterValues;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
    visible,
    onClose,
    onApply,
    initialValues = {},
}) => {
    const { brands, fetchBrands } = useBrandStore();
    const [activeTab, setActiveTab] = useState<'brand' | 'price' | 'mileage'>('brand');
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0]);
    const [selectedMileage, setSelectedMileage] = useState(MILEAGE_RANGES[0]);

    useEffect(() => {
        if (visible && brands.length === 0) {
            fetchBrands();
        }
    }, [visible]);

    // 初始化选中值
    useEffect(() => {
        if (initialValues.brandId) {
            const brand = brands.find(b => b.id === initialValues.brandId);
            if (brand) setSelectedBrand(brand);
        }
        if (initialValues.priceMin !== undefined || initialValues.priceMax !== undefined) {
            const price = PRICE_RANGES.find(
                p => p.min === initialValues.priceMin && p.max === initialValues.priceMax
            );
            if (price) setSelectedPrice(price);
        }
        if (initialValues.mileageMin !== undefined || initialValues.mileageMax !== undefined) {
            const mileage = MILEAGE_RANGES.find(
                m => m.min === initialValues.mileageMin && m.max === initialValues.mileageMax
            );
            if (mileage) setSelectedMileage(mileage);
        }
    }, [initialValues, brands]);

    const handleReset = () => {
        setSelectedBrand(null);
        setSelectedPrice(PRICE_RANGES[0]);
        setSelectedMileage(MILEAGE_RANGES[0]);
    };

    const handleApply = () => {
        onApply({
            brandId: selectedBrand?.id,
            brandName: selectedBrand?.name,
            priceMin: selectedPrice.min,
            priceMax: selectedPrice.max,
            mileageMin: selectedMileage.min,
            mileageMax: selectedMileage.max,
        });
        onClose();
    };

    const tabs = [
        { key: 'brand' as const, label: '品牌', value: selectedBrand?.name || '不限' },
        { key: 'price' as const, label: '价格', value: selectedPrice.label },
        { key: 'mileage' as const, label: '里程', value: selectedMileage.label },
    ];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.container}>
                    {/* 标签栏 */}
                    <View style={styles.tabBar}>
                        {tabs.map(tab => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                                onPress={() => setActiveTab(tab.key)}
                            >
                                <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                                    {tab.label}
                                </Text>
                                <Text style={[styles.tabValue, activeTab === tab.key && styles.tabValueActive]}>
                                    {tab.value}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* 内容区域 */}
                    <ScrollView style={styles.content}>
                        {activeTab === 'brand' && (
                            <View style={styles.optionGrid}>
                                <TouchableOpacity
                                    style={[styles.optionItem, !selectedBrand && styles.optionItemActive]}
                                    onPress={() => setSelectedBrand(null)}
                                >
                                    <Text style={[styles.optionText, !selectedBrand && styles.optionTextActive]}>
                                        不限
                                    </Text>
                                </TouchableOpacity>
                                {brands.map(brand => (
                                    <TouchableOpacity
                                        key={brand.id}
                                        style={[
                                            styles.optionItem,
                                            selectedBrand?.id === brand.id && styles.optionItemActive,
                                        ]}
                                        onPress={() => setSelectedBrand(brand)}
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                selectedBrand?.id === brand.id && styles.optionTextActive,
                                            ]}
                                        >
                                            {brand.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {activeTab === 'price' && (
                            <View style={styles.optionList}>
                                {PRICE_RANGES.map((range, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.listItem,
                                            selectedPrice === range && styles.listItemActive,
                                        ]}
                                        onPress={() => setSelectedPrice(range)}
                                    >
                                        <Text
                                            style={[
                                                styles.listItemText,
                                                selectedPrice === range && styles.listItemTextActive,
                                            ]}
                                        >
                                            {range.label}
                                        </Text>
                                        {selectedPrice === range && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {activeTab === 'mileage' && (
                            <View style={styles.optionList}>
                                {MILEAGE_RANGES.map((range, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.listItem,
                                            selectedMileage === range && styles.listItemActive,
                                        ]}
                                        onPress={() => setSelectedMileage(range)}
                                    >
                                        <Text
                                            style={[
                                                styles.listItemText,
                                                selectedMileage === range && styles.listItemTextActive,
                                            ]}
                                        >
                                            {range.label}
                                        </Text>
                                        {selectedMileage === range && (
                                            <Text style={styles.checkmark}>✓</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </ScrollView>

                    {/* 底部按钮 */}
                    <View style={styles.footer}>
                        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                            <Text style={styles.resetButtonText}>重置</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
                            <Text style={styles.applyButtonText}>确定</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};


const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    backdrop: {
        flex: 1,
    },
    container: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        maxHeight: '80%',
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: colors.primary,
    },
    tabLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    tabLabelActive: {
        color: colors.primary,
    },
    tabValue: {
        fontSize: typography.sizes.md,
        color: colors.text,
        fontWeight: '500',
    },
    tabValueActive: {
        color: colors.primary,
    },
    content: {
        padding: spacing.md,
        minHeight: 300,
    },
    optionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -spacing.xs,
    },
    optionItem: {
        width: '25%',
        paddingHorizontal: spacing.xs,
        marginBottom: spacing.sm,
    },
    optionItemActive: {},
    optionText: {
        textAlign: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.xs,
        backgroundColor: colors.surface,
        borderRadius: 8,
        fontSize: typography.sizes.sm,
        color: colors.text,
        overflow: 'hidden',
    },
    optionTextActive: {
        backgroundColor: colors.primaryLight,
        color: colors.primary,
    },
    optionList: {},
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: colors.border,
    },
    listItemActive: {},
    listItemText: {
        fontSize: typography.sizes.md,
        color: colors.text,
    },
    listItemTextActive: {
        color: colors.primary,
        fontWeight: '500',
    },
    checkmark: {
        fontSize: typography.sizes.lg,
        color: colors.primary,
    },
    footer: {
        flexDirection: 'row',
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: spacing.md,
    },
    resetButton: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
    },
    resetButtonText: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
    },
    applyButton: {
        flex: 2,
        paddingVertical: spacing.md,
        borderRadius: 8,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    applyButtonText: {
        fontSize: typography.sizes.md,
        color: '#fff',
        fontWeight: '600',
    },
});

export default FilterPanel;
