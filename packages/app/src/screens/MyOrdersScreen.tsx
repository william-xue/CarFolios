import React, { useEffect, useState, useCallback } from 'react'
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Image,
    Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { theme, colors, spacing } from '../theme'
import { orderApi } from '../api'
import type { Order } from '../types'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

type TabType = 'all' | 'pending' | 'paid' | 'completed' | 'cancelled'

const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待付款' },
    { key: 'paid', label: '已付款' },
    { key: 'completed', label: '已完成' },
    { key: 'cancelled', label: '已取消' },
]

const statusMap: Record<string, { text: string; color: string }> = {
    pending: { text: '待付款', color: colors.warning },
    paid: { text: '已付款', color: colors.success },
    completed: { text: '已完成', color: colors.textSecondary },
    cancelled: { text: '已取消', color: colors.textLight },
}

export function MyOrdersScreen() {
    const navigation = useNavigation<NavigationProp>()
    const [activeTab, setActiveTab] = useState<TabType>('all')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const fetchMyOrders = useCallback(async () => {
        try {
            const params: Record<string, string | undefined> = {}
            if (activeTab !== 'all') {
                params.status = activeTab
            }
            const result = await orderApi.getMyOrders(params)
            setOrders(result.list)
        } catch (error) {
            Alert.alert('错误', '获取订单列表失败')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [activeTab])

    useEffect(() => {
        setLoading(true)
        fetchMyOrders()
    }, [fetchMyOrders])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchMyOrders()
    }

    const handleOrderPress = (order: Order) => {
        navigation.navigate('CarDetail', { carId: order.carId })
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    }

    const formatPrice = (price: number) => {
        return `¥${(price / 10000).toFixed(2)}万`
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
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>暂无订单</Text>
        </View>
    )

    const renderItem = ({ item }: { item: Order }) => {
        const status = statusMap[item.status] || statusMap.pending

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => handleOrderPress(item)}
            >
                {/* 订单头部 */}
                <View style={styles.orderHeader}>
                    <Text style={styles.orderNo}>订单号: {item.orderNo}</Text>
                    <Text style={[styles.orderStatus, { color: status.color }]}>
                        {status.text}
                    </Text>
                </View>

                {/* 车辆信息 */}
                <View style={styles.carInfo}>
                    <Image source={{ uri: item.carImage }} style={styles.carImage} />
                    <View style={styles.carDetails}>
                        <Text style={styles.carTitle} numberOfLines={2}>
                            {item.carTitle}
                        </Text>
                        <Text style={styles.carPrice}>{formatPrice(item.carPrice)}</Text>
                    </View>
                </View>

                {/* 订单底部 */}
                <View style={styles.orderFooter}>
                    <Text style={styles.orderDate}>下单时间: {formatDate(item.createdAt)}</Text>
                    <Text style={styles.depositAmount}>
                        诚意金: ¥{item.depositAmount.toLocaleString()}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

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

            {/* 订单列表 */}
            <FlatList
                data={orders}
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
        paddingHorizontal: spacing.xs,
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
        fontSize: theme.fontSize.xs,
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
    orderCard: {
        backgroundColor: colors.white,
        borderRadius: theme.borderRadius.lg,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    orderNo: {
        fontSize: theme.fontSize.xs,
        color: colors.textSecondary,
    },
    orderStatus: {
        fontSize: theme.fontSize.sm,
        fontWeight: '600',
    },
    carInfo: {
        flexDirection: 'row',
        padding: spacing.md,
    },
    carImage: {
        width: 100,
        height: 75,
        borderRadius: theme.borderRadius.md,
        backgroundColor: colors.border,
    },
    carDetails: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'space-between',
    },
    carTitle: {
        fontSize: theme.fontSize.md,
        color: colors.text,
        fontWeight: '500',
        lineHeight: 22,
    },
    carPrice: {
        fontSize: theme.fontSize.lg,
        color: colors.primary,
        fontWeight: 'bold',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        backgroundColor: colors.background,
    },
    orderDate: {
        fontSize: theme.fontSize.xs,
        color: colors.textLight,
    },
    depositAmount: {
        fontSize: theme.fontSize.sm,
        color: colors.text,
        fontWeight: '500',
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
    },
})
