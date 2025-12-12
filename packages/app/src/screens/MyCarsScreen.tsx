import React, { useEffect, useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { theme, colors, spacing } from '../theme'
import { CarCard } from '../components'
import { carApi } from '../api'
import type { Car } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

type TabType = 'all' | 'pending' | 'approved' | 'rejected'

const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待审核' },
    { key: 'approved', label: '已上架' },
    { key: 'rejected', label: '已下架' },
]

export function MyCarsScreen() {
    const navigation = useNavigation<NavigationProp>()
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [cars, setCars] = useState<Car[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchMyCars = useCallback(async () => {
        try {
            const params: Record<string, string | undefined> = {}
            if (activeTab !== 'all') {
                params.status = activeTab
            }
            const result = await carApi.getMyCars(params)
            setCars(result.list)
        } catch (error) {
            Alert.alert('错误', '获取车辆列表失败')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [activeTab])

    useEffect(() => {
        setLoading(true)
        fetchMyCars()
    }, [fetchMyCars])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchMyCars()
    }

    const handleCarPress = (car: Car) => {
        navigation.navigate('CarDetail', { carId: car.id })
    }

    const handlePublish = () => {
        navigation.navigate('Publish' as keyof RootStackParamList)
    }

    const renderTab = ({ key, label }: { key: TabType; label: string }) => (
        <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.tabActive]}
            onPress={() => setActiveTab(key)}
        >
            <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    )

    const renderEmpty = () => (
        <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>暂无车辆</Text>
            <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
                <Text style={styles.publishButtonText}>发布车辆</Text>
            </TouchableOpacity>
        </View>
    )

    const renderItem = ({ item }: { item: Car }) => (
        <View style={styles.cardWrapper}>
            <CarCard car={item} onPress={() => handleCarPress(item)} />
            <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                    {item.status === 'pending'
                        ? '待审核'
                        : item.status === 'approved'
                            ? '已上架'
                            : '已下架'}
                </Text>
            </View>
        </View>
    )

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* Tab 栏 */}
            <View style={styles.tabBar}>{tabs.map(renderTab)}</View>

            {/* 车辆列表 */}
            <FlatList
                data={cars}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmpty}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[colors.primary]}
                    />
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingHorizontal: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: theme.fontSize.sm,
        color: colors.textSecondary,
    },
    tabTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    listContent: {
        padding: spacing.md,
        flexGrow: 1,
    },
    cardWrapper: {
        marginBottom: spacing.md,
        position: 'relative',
    },
    statusBadge: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
    },
    statusText: {
        fontSize: theme.fontSize.xs,
        color: colors.white,
    },
    empty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: spacing.xxl * 2,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: theme.fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    publishButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.sm,
        borderRadius: theme.borderRadius.md,
    },
    publishButtonText: {
        fontSize: theme.fontSize.md,
        color: colors.white,
        fontWeight: '600',
    },
})
