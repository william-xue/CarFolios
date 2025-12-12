import { Alert } from 'react-native'
import { useUserStore } from '../stores'

type NavigationLike = {
    navigate: (screen: string, params?: object) => void
}

/**
 * 认证守卫 - 检查用户是否已登录
 * @param navigation 导航对象
 * @param callback 登录后执行的回调
 * @returns 是否已登录
 */
export function requireAuth(
    navigation: NavigationLike,
    callback?: () => void
): boolean {
    const { isLoggedIn } = useUserStore.getState()

    if (!isLoggedIn) {
        Alert.alert(
            '请先登录',
            '该功能需要登录后才能使用',
            [
                { text: '取消', style: 'cancel' },
                {
                    text: '去登录',
                    onPress: () => {
                        navigation.navigate('Login')
                    },
                },
            ],
            { cancelable: true }
        )
        return false
    }

    if (callback) {
        callback()
    }
    return true
}

/**
 * 检查是否已登录（不弹窗）
 */
export function isAuthenticated(): boolean {
    return useUserStore.getState().isLoggedIn
}

/**
 * 获取当前用户 ID
 */
export function getCurrentUserId(): number | null {
    const { user } = useUserStore.getState()
    return user?.id ?? null
}

/**
 * 认证守卫 Hook - 用于组件内
 */
export function useAuthGuard() {
    const { isLoggedIn, user } = useUserStore()

    const checkAuth = (navigation: NavigationLike, callback?: () => void) => {
        return requireAuth(navigation, callback)
    }

    return {
        isLoggedIn,
        user,
        checkAuth,
    }
}
