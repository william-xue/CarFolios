import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { theme, colors, spacing } from '../theme'
import { ImagePicker } from '../components/ImagePicker'
import { useUserStore, useBrandStore, useRegionStore } from '../stores'
import { carApi } from '../api'
import type { Brand, Series, Region, PublishCarParams } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

export function PublishScreen() {
    const navigation = useNavigation<NavigationProp>()
    const { isLoggedIn } = useUserStore()
    const { brands, fetchBrands } = useBrandStore()
    const { provinces, fetchProvinces, fetchCities } = useRegionStore()

    // 表单状态
    const [images, setImages] = useState<string[]>([])
    const [title, setTitle] = useState('')
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
    const [selectedSeries, setSelectedSeries] = useState<Series | null>(null)
    const [seriesList, setSeriesList] = useState<Series[]>([])
    const [firstRegDate, setFirstRegDate] = useState('')
    const [mileage, setMileage] = useState('')
    const [price, setPrice] = useState('')
    const [selectedProvince, setSelectedProvince] = useState<Region | null>(null)
    const [selectedCity, setSelectedCity] = useState<Region | null>(null)
    const [cities, setCities] = useState<Region[]>([])
    const [highlightDesc, setHighlightDesc] = useState('')
    const [gearbox, setGearbox] = useState<'手动' | '自动'>('自动')

    // UI 状态
    const [showBrandPicker, setShowBrandPicker] = useState(false)
    const [showSeriesPicker, setShowSeriesPicker] = useState(false)
    const [showProvincePicker, setShowProvincePicker] = useState(false)
    const [showCityPicker, setShowCityPicker] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isLoggedIn) {
            Alert.alert('提示', '请先登录', [
                { text: '确定', onPress: () => navigation.navigate('Login') },
            ])
            return
        }
        fetchBrands()
        fetchProvinces()
    }, [isLoggedIn, fetchBrands, fetchProvinces, navigation])

    // 选择品牌后加载车系
    const handleBrandSelect = async (brand: Brand) => {
        setSelectedBrand(brand)
        setSelectedSeries(null)
        setShowBrandPicker(false)
        // TODO: 从 API 获取车系列表
        // 临时模拟数据
        setSeriesList([
            { id: 1, name: `${brand.name} 系列1`, brandId: brand.id },
            { id: 2, name: `${brand.name} 系列2`, brandId: brand.id },
        ])
    }

    // 选择省份后加载城市
    const handleProvinceSelect = async (province: Region) => {
        setSelectedProvince(province)
        setSelectedCity(null)
        setShowProvincePicker(false)
        const cityList = await fetchCities(province.id)
        setCities(cityList)
    }

    // 表单验证
    const validateForm = (): boolean => {
        if (images.length === 0) {
            Alert.alert('提示', '请至少上传一张车辆图片')
            return false
        }
        if (!title.trim()) {
            Alert.alert('提示', '请输入车辆标题')
            return false
        }
        if (!selectedBrand || !selectedSeries) {
            Alert.alert('提示', '请选择品牌和车系')
            return false
        }
        if (!firstRegDate) {
            Alert.alert('提示', '请输入首次上牌日期')
            return false
        }
        if (!mileage || isNaN(Number(mileage))) {
            Alert.alert('提示', '请输入正确的行驶里程')
            return false
        }
        if (!price || isNaN(Number(price))) {
            Alert.alert('提示', '请输入正确的售价')
            return false
        }
        if (!selectedProvince || !selectedCity) {
            Alert.alert('提示', '请选择所在地区')
            return false
        }
        return true
    }

    // 提交发布
    const handleSubmit = async () => {
        if (!validateForm()) return

        setSubmitting(true)
        try {
            const params: PublishCarParams = {
                title: title.trim(),
                brandId: selectedBrand!.id,
                seriesId: selectedSeries!.id,
                firstRegDate,
                mileage: Number(mileage),
                price: Number(price) * 10000, // 转换为元
                cityCode: selectedCity!.id.toString(),
                cityName: selectedCity!.name,
                images,
                highlightDesc: highlightDesc.trim() || undefined,
                gearbox,
            }

            await carApi.publishCar(params)
            Alert.alert('发布成功', '您的车辆信息已提交，等待审核', [
                { text: '确定', onPress: () => navigation.goBack() },
            ])
        } catch (error) {
            Alert.alert('发布失败', '请稍后重试')
        } finally {
            setSubmitting(false)
        }
    }

    // 渲染选择器弹窗
    const renderPicker = (
        visible: boolean,
        title: string,
        data: { id: number; name: string }[],
        onSelect: (item: { id: number; name: string }) => void,
        onClose: () => void
    ) => {
        if (!visible) return null

        return (
            <View style={styles.pickerOverlay}>
                <TouchableOpacity style={styles.pickerBackdrop} onPress={onClose} />
                <View style={styles.pickerContainer}>
                    <View style={styles.pickerHeader}>
                        <Text style={styles.pickerTitle}>{title}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.pickerClose}>关闭</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.pickerList}>
                        {data.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.pickerItem}
                                onPress={() => onSelect(item)}
                            >
                                <Text style={styles.pickerItemText}>{item.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>
        )
    }

    if (!isLoggedIn) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>请先登录</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* 图片上传 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>车辆图片 *</Text>
                    <ImagePicker images={images} onChange={setImages} maxCount={9} />
                </View>

                {/* 基本信息 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>基本信息</Text>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>标题 *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="例如：2020款 宝马3系 325Li"
                            placeholderTextColor={colors.textLight}
                            value={title}
                            onChangeText={setTitle}
                            maxLength={50}
                        />
                    </View>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>品牌 *</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => setShowBrandPicker(true)}
                        >
                            <Text
                                style={[
                                    styles.selectText,
                                    !selectedBrand && styles.selectPlaceholder,
                                ]}
                            >
                                {selectedBrand?.name || '请选择品牌'}
                            </Text>
                            <Text style={styles.selectArrow}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>车系 *</Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => selectedBrand && setShowSeriesPicker(true)}
                            disabled={!selectedBrand}
                        >
                            <Text
                                style={[
                                    styles.selectText,
                                    !selectedSeries && styles.selectPlaceholder,
                                ]}
                            >
                                {selectedSeries?.name || '请先选择品牌'}
                            </Text>
                            <Text style={styles.selectArrow}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>首次上牌 *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="例如：2020-06"
                            placeholderTextColor={colors.textLight}
                            value={firstRegDate}
                            onChangeText={setFirstRegDate}
                            maxLength={7}
                        />
                    </View>

                    <View style={styles.formRow}>
                        <View style={[styles.formItem, styles.formItemHalf]}>
                            <Text style={styles.label}>里程(万公里) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="例如：3.5"
                                placeholderTextColor={colors.textLight}
                                keyboardType="decimal-pad"
                                value={mileage}
                                onChangeText={setMileage}
                            />
                        </View>
                        <View style={[styles.formItem, styles.formItemHalf]}>
                            <Text style={styles.label}>售价(万元) *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="例如：25.8"
                                placeholderTextColor={colors.textLight}
                                keyboardType="decimal-pad"
                                value={price}
                                onChangeText={setPrice}
                            />
                        </View>
                    </View>

                    <View style={styles.formItem}>
                        <Text style={styles.label}>变速箱</Text>
                        <View style={styles.radioGroup}>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    gearbox === '自动' && styles.radioButtonActive,
                                ]}
                                onPress={() => setGearbox('自动')}
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        gearbox === '自动' && styles.radioTextActive,
                                    ]}
                                >
                                    自动
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.radioButton,
                                    gearbox === '手动' && styles.radioButtonActive,
                                ]}
                                onPress={() => setGearbox('手动')}
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        gearbox === '手动' && styles.radioTextActive,
                                    ]}
                                >
                                    手动
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 所在地区 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>所在地区</Text>

                    <View style={styles.formRow}>
                        <View style={[styles.formItem, styles.formItemHalf]}>
                            <Text style={styles.label}>省份 *</Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => setShowProvincePicker(true)}
                            >
                                <Text
                                    style={[
                                        styles.selectText,
                                        !selectedProvince && styles.selectPlaceholder,
                                    ]}
                                >
                                    {selectedProvince?.name || '选择省份'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.formItem, styles.formItemHalf]}>
                            <Text style={styles.label}>城市 *</Text>
                            <TouchableOpacity
                                style={styles.selectButton}
                                onPress={() => selectedProvince && setShowCityPicker(true)}
                                disabled={!selectedProvince}
                            >
                                <Text
                                    style={[
                                        styles.selectText,
                                        !selectedCity && styles.selectPlaceholder,
                                    ]}
                                >
                                    {selectedCity?.name || '选择城市'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* 车辆亮点 */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>车辆亮点</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="描述车辆的亮点和特色，如：原版原漆、无事故、低里程等"
                        placeholderTextColor={colors.textLight}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={highlightDesc}
                        onChangeText={setHighlightDesc}
                        maxLength={500}
                    />
                </View>

                {/* 提交按钮 */}
                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator size="small" color={colors.white} />
                    ) : (
                        <Text style={styles.submitButtonText}>发布车辆</Text>
                    )}
                </TouchableOpacity>

                <View style={styles.bottomSpace} />
            </ScrollView>

            {/* 选择器弹窗 */}
            {renderPicker(
                showBrandPicker,
                '选择品牌',
                brands,
                (item) => handleBrandSelect(item as Brand),
                () => setShowBrandPicker(false)
            )}
            {renderPicker(
                showSeriesPicker,
                '选择车系',
                seriesList,
                (item) => {
                    setSelectedSeries(item as Series)
                    setShowSeriesPicker(false)
                },
                () => setShowSeriesPicker(false)
            )}
            {renderPicker(
                showProvincePicker,
                '选择省份',
                provinces,
                (item) => handleProvinceSelect(item as Region),
                () => setShowProvincePicker(false)
            )}
            {renderPicker(
                showCityPicker,
                '选择城市',
                cities,
                (item) => {
                    setSelectedCity(item as Region)
                    setShowCityPicker(false)
                },
                () => setShowCityPicker(false)
            )}
        </KeyboardAvoidingView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: theme.fontSize.md,
        color: colors.textSecondary,
    },
    section: {
        backgroundColor: colors.white,
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.md,
    },
    formItem: {
        marginBottom: spacing.md,
    },
    formRow: {
        flexDirection: 'row',
        marginHorizontal: -spacing.xs,
    },
    formItemHalf: {
        flex: 1,
        marginHorizontal: spacing.xs,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    input: {
        height: 44,
        backgroundColor: colors.background,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: spacing.md,
        fontSize: theme.fontSize.md,
        color: colors.text,
    },
    textArea: {
        height: 100,
        paddingTop: spacing.sm,
    },
    selectButton: {
        height: 44,
        backgroundColor: colors.background,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    selectText: {
        fontSize: theme.fontSize.md,
        color: colors.text,
    },
    selectPlaceholder: {
        color: colors.textLight,
    },
    selectArrow: {
        fontSize: 18,
        color: colors.textLight,
    },
    radioGroup: {
        flexDirection: 'row',
    },
    radioButton: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background,
        borderRadius: theme.borderRadius.md,
        marginRight: spacing.sm,
    },
    radioButtonActive: {
        backgroundColor: colors.primary,
    },
    radioText: {
        fontSize: theme.fontSize.sm,
        color: colors.text,
    },
    radioTextActive: {
        color: colors.white,
    },
    submitButton: {
        height: 50,
        backgroundColor: colors.primary,
        borderRadius: theme.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: spacing.md,
        marginTop: spacing.xl,
    },
    submitButtonDisabled: {
        backgroundColor: colors.border,
    },
    submitButtonText: {
        fontSize: theme.fontSize.md,
        color: colors.white,
        fontWeight: 'bold',
    },
    bottomSpace: {
        height: spacing.xxl,
    },
    // Picker 弹窗样式
    pickerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'flex-end',
    },
    pickerBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    pickerContainer: {
        backgroundColor: colors.white,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        maxHeight: '60%',
    },
    pickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    pickerTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: '600',
        color: colors.text,
    },
    pickerClose: {
        fontSize: theme.fontSize.md,
        color: colors.primary,
    },
    pickerList: {
        maxHeight: 300,
    },
    pickerItem: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    pickerItemText: {
        fontSize: theme.fontSize.md,
        color: colors.text,
    },
})
