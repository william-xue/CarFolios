import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Text, View, StyleSheet } from 'react-native'
import type { RootStackParamList, RootTabParamList } from './types'
import { theme } from '../theme'
import {
    HomeScreen,
    SearchScreen,
    CarDetailScreen,
    LoginScreen,
    MineScreen,
    MyCarsScreen,
    MyOrdersScreen,
    PublishScreen,
} from '../screens'

// 临时占位 Screen 组件
function PlaceholderScreen({ title }: { title: string }) {
    return (
        <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{title}</Text>
        </View>
    )
}

function MyFavoritesScreen() {
    return <PlaceholderScreen title="我的收藏" />
}

function SettingsScreen() {
    return <PlaceholderScreen title="设置" />
}

// Tab 图标组件
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        Home: '🏠',
        Search: '🔍',
        Publish: '➕',
        Mine: '👤',
    }
    return (
        <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {icons[name] || '•'}
        </Text>
    )
}

const Tab = createBottomTabNavigator<RootTabParamList>()
const Stack = createNativeStackNavigator<RootStackParamList>()

// 底部 Tab 导航
function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => (
                    <TabIcon name={route.name} focused={focused} />
                ),
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textLight,
                tabBarStyle: styles.tabBar,
                tabBarLabelStyle: styles.tabBarLabel,
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarLabel: '首页' }}
            />
            <Tab.Screen
                name="Search"
                component={SearchScreen}
                options={{ tabBarLabel: '搜索' }}
            />
            <Tab.Screen
                name="Publish"
                component={PublishScreen}
                options={{ tabBarLabel: '发布' }}
            />
            <Tab.Screen
                name="Mine"
                component={MineScreen}
                options={{ tabBarLabel: '我的' }}
            />
        </Tab.Navigator>
    )
}

// 根导航
export function RootNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="MainTabs" component={MainTabs} />
                <Stack.Screen
                    name="CarDetail"
                    component={CarDetailScreen}
                    options={{ headerShown: true, title: '车辆详情' }}
                />
                <Stack.Screen
                    name="Search"
                    component={SearchScreen}
                    options={{ headerShown: true, title: '搜索' }}
                />
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{
                        headerShown: true,
                        title: '登录',
                        presentation: 'modal',
                    }}
                />
                <Stack.Screen
                    name="MyCars"
                    component={MyCarsScreen}
                    options={{ headerShown: true, title: '我的车辆' }}
                />
                <Stack.Screen
                    name="MyOrders"
                    component={MyOrdersScreen}
                    options={{ headerShown: true, title: '我的订单' }}
                />
                <Stack.Screen
                    name="MyFavorites"
                    component={MyFavoritesScreen}
                    options={{ headerShown: true, title: '我的收藏' }}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ headerShown: true, title: '设置' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}

const styles = StyleSheet.create({
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
    },
    placeholderText: {
        fontSize: theme.fontSize.xl,
        color: theme.colors.textSecondary,
    },
    tabBar: {
        backgroundColor: theme.colors.white,
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
    },
    tabBarLabel: {
        fontSize: theme.fontSize.xs,
    },
})

export * from './types'
