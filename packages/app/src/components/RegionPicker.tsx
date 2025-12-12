import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    Pressable,
    ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography } from '../theme';
import { useRegionStore } from '../stores';
import type { Region } from '../types';

interface RegionPickerProps {
    visible: boolean;
    onClose: () => void;
    onSelect: (region: { province?: Region; city?: Region; district?: Region }) => void;
    initialValue?: { provinceId?: number; cityId?: number; districtId?: number };
}

export const RegionPicker: React.FC<RegionPickerProps> = ({
    visible,
    onClose,
    onSelect,
    initialValue,
}) => {
    const { provinces, cities, districts, loading, fetchProvinces, fetchCities, fetchDistricts } =
        useRegionStore();

    const [selectedProvince, setSelectedProvince] = useState<Region | null>(null);
    const [selectedCity, setSelectedCity] = useState<Region | null>(null);
    const [selectedDistrict, setSelectedDistrict] = useState<Region | null>(null);
    const [activeLevel, setActiveLevel] = useState<'province' | 'city' | 'district'>('province');

    // 加载省份数据
    useEffect(() => {
        if (visible && provinces.length === 0) {
            fetchProvinces();
        }
    }, [visible]);

    // 初始化选中值
    useEffect(() => {
        if (initialValue?.provinceId && provinces.length > 0) {
            const province = provinces.find(p => p.id === initialValue.provinceId);
            if (province) {
                setSelectedProvince(province);
                fetchCities(province.id);
            }
        }
    }, [initialValue, provinces]);

    // 选择省份
    const handleSelectProvince = (province: Region) => {
        setSelectedProvince(province);
        setSelectedCity(null);
        setSelectedDistrict(null);
        setActiveLevel('city');
        fetchCities(province.id);
    };

    // 选择城市
    const handleSelectCity = (city: Region) => {
        setSelectedCity(city);
        setSelectedDistrict(null);
        setActiveLevel('district');
        fetchDistricts(city.id);
    };

    // 选择区县
    const handleSelectDistrict = (district: Region) => {
        setSelectedDistrict(district);
    };

    // 确认选择
    const handleConfirm = () => {
        onSelect({
            province: selectedProvince || undefined,
            city: selectedCity || undefined,
            district: selectedDistrict || undefined,
        });
        onClose();
    };

    // 重置
    const handleReset = () => {
        setSelectedProvince(null);
        setSelectedCity(null);
        setSelectedDistrict(null);
        setActiveLevel('province');
    };

    // 获取当前显示的列表
    const getCurrentList = () => {
        switch (activeLevel) {
            case 'province':
                return provinces;
            case 'city':
                return cities;
            case 'district':
                return districts;
            default:
                return [];
        }
    };

    // 获取当前选中项
    const getCurrentSelected = () => {
        switch (activeLevel) {
            case 'province':
                return selectedProvince;
            case 'city':
                return selectedCity;
            case 'district':
                return selectedDistrict;
            default:
                return null;
        }
    };

    // 处理选择
    const handleSelect = (item: Region) => {
        switch (activeLevel) {
            case 'province':
                handleSelectProvince(item);
                break;
            case 'city':
                handleSelectCity(item);
                break;
            case 'district':
                handleSelectDistrict(item);
                break;
        }
    };

    const breadcrumbs = [
        { level: 'province' as const, label: selectedProvince?.name || '请选择省份' },
        ...(selectedProvince
            ? [{ level: 'city' as const, label: selectedCity?.name || '请选择城市' }]
            : []),
        ...(selectedCity
            ? [{ level: 'district' as const, label: selectedDistrict?.name || '请选择区县' }]
            : []),
    ];

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.overlay}>
                <Pressable style={styles.backdrop} onPress={onClose} />
                <View style={styles.container}>
                    {/* 标题 */}
                    <View style={styles.header}>
                        <Text style={styles.title}>选择地区</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* 面包屑导航 */}
                    <View style={styles.breadcrumbs}>
                        {breadcrumbs.map((item, index) => (
                            <React.Fragment key={item.level}>
                                {index > 0 && <Text style={styles.breadcrumbSeparator}>/</Text>}
                                <TouchableOpacity
                                    onPress={() => setActiveLevel(item.level)}
                                    style={[
                                        styles.breadcrumbItem,
                                        activeLevel === item.level && styles.breadcrumbItemActive,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.breadcrumbText,
                                            activeLevel === item.level && styles.breadcrumbTextActive,
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            </React.Fragment>
                        ))}
                    </View>

                    {/* 列表内容 */}
                    <ScrollView style={styles.content}>
                        {loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={colors.primary} />
                                <Text style={styles.loadingText}>加载中...</Text>
                            </View>
                        ) : (
                            <View style={styles.list}>
                                {/* 不限选项 */}
                                {activeLevel === 'province' && (
                                    <TouchableOpacity
                                        style={[styles.listItem, !selectedProvince && styles.listItemActive]}
                                        onPress={() => {
                                            setSelectedProvince(null);
                                            setSelectedCity(null);
                                            setSelectedDistrict(null);
                                        }}
                                    >
                                        <Text
                                            style={[styles.listItemText, !selectedProvince && styles.listItemTextActive]}
                                        >
                                            全国
                                        </Text>
                                        {!selectedProvince && <Text style={styles.checkmark}>✓</Text>}
                                    </TouchableOpacity>
                                )}

                                {getCurrentList().map(item => (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={[
                                            styles.listItem,
                                            getCurrentSelected()?.id === item.id && styles.listItemActive,
                                        ]}
                                        onPress={() => handleSelect(item)}
                                    >
                                        <Text
                                            style={[
                                                styles.listItemText,
                                                getCurrentSelected()?.id === item.id && styles.listItemTextActive,
                                            ]}
                                        >
                                            {item.name}
                                        </Text>
                                        {getCurrentSelected()?.id === item.id && (
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
                        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                            <Text style={styles.confirmButtonText}>确定</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: '600',
        color: colors.text,
    },
    closeButton: {
        fontSize: typography.sizes.xl,
        color: colors.textSecondary,
        padding: spacing.xs,
    },
    breadcrumbs: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.surface,
    },
    breadcrumbItem: {
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
    },
    breadcrumbItemActive: {
        backgroundColor: colors.primaryLight,
        borderRadius: 4,
    },
    breadcrumbText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    breadcrumbTextActive: {
        color: colors.primary,
        fontWeight: '500',
    },
    breadcrumbSeparator: {
        color: colors.textSecondary,
        marginHorizontal: spacing.xs,
    },
    content: {
        minHeight: 300,
        maxHeight: 400,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl,
    },
    loadingText: {
        marginTop: spacing.sm,
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    list: {
        padding: spacing.md,
    },
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
    confirmButton: {
        flex: 2,
        paddingVertical: spacing.md,
        borderRadius: 8,
        backgroundColor: colors.primary,
        alignItems: 'center',
    },
    confirmButtonText: {
        fontSize: typography.sizes.md,
        color: '#fff',
        fontWeight: '600',
    },
});

export default RegionPicker;
