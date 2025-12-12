import React, { useEffect } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/types'
import { theme, colors, spacing } from '../theme'
import { useUserStore } from '../stores'

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface MenuItem {
    icon: string
    title: string
    screen: keyof RootStackParamList
    requireAuth?: boolean
}

const menuItems: MenuItem[] = [
    { icon: '🚗', title: '我的车辆', screen: 'MyCars', requireAuth: true },
    { icon: '📋', title: '我的订单', screen: 'MyOrders', requireAuth: true },
    { icon: '❤️', title: '我的收藏', screen: 'MyFavorites', requireAuth: true },
    { icon: '⚙️', title: '设置', screen: 'Settings' },
]

export function MineScreen() {
    const navigation = useNavigation<NavigationProp>()
    const { user, isLoggedIn, restoreSession, logout } = useUserStore()

    useEffect(() => {
        restoreSession()
    }, [restoreSession])

    const handleLogin = () => {
        navigation.navigate('Login')
    }

    const handleMenuPress = (item: MenuItem) => {
        if (item.requireAuth && !isLoggedIn) {
            navigation.navigate('Login')
            return
        }
        navigation.navigate(item.screen as keyof RootStackParamList)
    }

    const handleLogout = () => {
        logout()
    }

    return (
        <ScrollView style={styles.container}>
            {/* 用户信息区域 */}
            <View style={styles.userSection}>
                {isLoggedIn && user ? (
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            {user.avatar ? (
                                <Image source={{ uri: user.avatar }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Text style={styles.avatarText}>
                                        {user.nickname?.charAt(0) || '用'}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.userDetails}>
                            <Text style={styles.nickname}>{user.nickname || '用户'}</Text>
                            <View style={styles.authBadge}>
                                <Text style={styles.authText}>
                                    {user.authStatus === 'verified' ? '✓ 已认证' : '未认证'}
                                </Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.loginPrompt} onPress={handleLogin}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>👤</Text>
                        </View>
                        <View style={styles.loginTextContainer}>
                            <Text style={styles.loginText}>点击登录</Text>
                            <Text style={styles.loginSubtext}>登录后享受更多服务</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {/* 功能菜单 */}
            <View style={styles.menuSection}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity
                        key={item.screen}
                        style={[
                            styles.menuItem,
                            index === menuItems.length - 1 && styles.menuItemLast,
                        ]}
                        onPress={() => handleMenuPress(item)}
                    >
                        <Text style={styles.menuIcon}>{item.icon}</Text>
                        <Text style={styles.menuTitle}>{item.title}</Text>
                        <Text style={styles.menuArrow}>›</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 退出登录按钮 */}
            {isLoggedIn && (
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>退出登录</Text>
                </TouchableOpacity>
            )}

            {/* 版本信息 */}
            <Text style={styles.version}>爱车出海 v1.0.0</Text>
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    userSection: {
        backgroundColor: colors.primary,
        paddingTop: spacing.xxl,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: spacing.md,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: colors.white,
    },
    avatarPlaceholder: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 28,
    },
    userDetails: {
        flex: 1,
    },
    nickname: {
        fontSize: theme.fontSize.xl,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: spacing.xs,
    },
    authBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.borderRadius.sm,
        alignSelf: 'flex-start',
    },
    authText: {
        fontSize: theme.fontSize.xs,
        color: colors.white,
    },
    loginPrompt: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loginTextContainer: {
        marginLeft: spacing.md,
    },
    loginText: {
        fontSize: theme.fontSize.xl,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: spacing.xs,
    },
    loginSubtext: {
        fontSize: theme.fontSize.sm,
        color: 'rgba(255,255,255,0.8)',
    },
    menuSection: {
        backgroundColor: colors.white,
        marginTop: spacing.md,
        marginHorizontal: spacing.md,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuItemLast: {
        borderBottomWidth: 0,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: spacing.md,
    },
    menuTitle: {
        flex: 1,
        fontSize: theme.fontSize.md,
        color: colors.text,
    },
    menuArrow: {
        fontSize: 20,
        color: colors.textLight,
    },
    logoutButton: {
        marginTop: spacing.xl,
        marginHorizontal: spacing.md,
        backgroundColor: colors.white,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    logoutText: {
        fontSize: theme.fontSize.md,
        color: colors.error,
    },
    version: {
        textAlign: 'center',
        fontSize: theme.fontSize.xs,
        color: colors.textLight,
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
    },
})
