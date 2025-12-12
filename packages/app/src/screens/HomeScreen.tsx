import React, { useEffect, useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { theme } from '../theme'
import { useCarStore } from '../stores/carStore'
import { useBrandStore } from '../stores/brandStore'
import {
    HeroSection,
    FeatureCards,
    BrandGrid,
    CarListTabs,
    CarCard,
} from '../components'
import type { TabType } from '../components'
import type { Car } from '../types'
import type { RootStackParamList } from '../navigation/types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

// Hero 轮播图数据
const heroSlides = [
    {
        image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
        alt: '豪华轿车',
    },
    {
        image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
        alt: '跑车',
    },
    {
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
        alt: '经典车型',
    },
]

// 平台统计数据
const platformStats = {
    cars: 2680,
    cities: 56,
    deals: 12800,
    partners: 320,
}

// 服务亮点数据
const features = [
    {
        icon: 'location-o',
        title: '全球车源',
        description: '覆盖全国优质车源',
        gradient: 'purple' as const,
    },
    {
        icon: 'credit-pay',
        title: '安全支付',
        description: '资金担保交易',
        gradient: 'pink' as const,
    },
    {
        icon: 'certificate',
        title: '专业检测',
        description: '200+项检测',
        gradient: 'blue' as const,
    },
    {
        icon: 'service-o',
        title: '贴心服务',
        description: '7x24小时在线',
        gradient: 'green' as const,
    },
]

export function HomeScreen() {
    const navigation = useNavigation<NavigationProp>()
    const { cars, loading, hasMore, fetchCars, refreshCars, loadMoreCars, setFilters } = useCarStore()
    const { brands, fetchBrands } = useBrandStore()

    const [refreshing, setRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState<TabType>('recommend')

    // 初始加载
    useEffect(() => {
        fetchCars({ page: 1 })
        fetchBrands()
    }, [])

    // 下拉刷新
    const onRefresh = useCallback(async () => {
        setRefreshing(true)
        await refreshCars()
        setRefreshing(false)
    }, [refreshCars])

    // 加载更多
    const onLoadMore = () => {
        if (!loading && hasMore) {
            loadMoreCars()
        }
    }

    // Tab 切换
    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab)
        setFilters({ sortBy: tab === 'latest' ? 'latest' : undefined })
        refreshCars()
    }

    // 品牌选择
    const handleBrandSelect = (brandId: number) => {
        navigation.navigate('Search', { brandId })
    }

    // 车辆详情
    const handleCarPress = (car: Car) => {
        navigation.navigate('CarDetail', { carId: car.id })
    }

    // 跳转搜索
    const goToSearch = () => {
        navigation.navigate('Search', {})
    }


    // 渲染车辆卡片
    const renderCarItem = ({ item }: { item: Car }) => (
        <CarCard car={item} onPress={() => handleCarPress(item)} />
    )

    // 渲染列表头部
    const renderHeader = () => (
        <>
            {/* Hero 轮播区 */}
            <HeroSection slides={heroSlides} stats={platformStats} />

            {/* 服务亮点 */}
            <FeatureCards features={features} />

            {/* 品牌快捷入口 */}
            <BrandGrid
                brands={brands}
                loading={brands.length === 0}
                onSelect={handleBrandSelect}
            />

            {/* 车源列表 Tab */}
            <CarListTabs activeTab={activeTab} onChange={handleTabChange} />
        </>
    )

    // 渲染列表底部
    const renderFooter = () => {
        if (!hasMore && cars.length > 0) {
            return (
                <View style={styles.footer}>
                    <Text style={styles.footerText}>没有更多了</Text>
                </View>
            )
        }
        if (loading && cars.length > 0) {
            return (
                <View style={styles.footer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                </View>
            )
        }
        return null
    }

    return (
        <View style={styles.container}>
            {/* 顶部搜索栏 */}
            <View style={styles.topBar}>
                <TouchableOpacity style={styles.locationEntry}>
                    <Text style={styles.locationIcon}>📍</Text>
                    <Text style={styles.locationText}>全国</Text>
                    <Text style={styles.arrow}>▼</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchBar} onPress={goToSearch}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <Text style={styles.searchPlaceholder}>搜索车型、品牌</Text>
                </TouchableOpacity>
            </View>

            {/* 车源列表 */}
            <FlatList
                data={cars}
                renderItem={renderCarItem}
                keyExtractor={(item) => item.id.toString()}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[theme.colors.primary]}
                        tintColor={theme.colors.primary}
                    />
                }
                onEndReached={onLoadMore}
                onEndReachedThreshold={0.3}
                showsVerticalScrollIndicator={false}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    locationEntry: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
    },
    locationIcon: {
        fontSize: 14,
    },
    locationText: {
        fontSize: theme.fontSize.md,
        color: theme.colors.text,
        marginHorizontal: 4,
        maxWidth: 60,
    },
    arrow: {
        fontSize: 8,
        color: theme.colors.textLight,
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.full,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
    },
    searchIcon: {
        fontSize: 14,
        marginRight: theme.spacing.sm,
    },
    searchPlaceholder: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textLight,
    },
    listContent: {
        paddingBottom: 80,
    },
    footer: {
        paddingVertical: theme.spacing.lg,
        alignItems: 'center',
    },
    footerText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textLight,
    },
})

export default HomeScreen
