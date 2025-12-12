import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native'

// 底部 Tab 导航参数
export type RootTabParamList = {
    Home: undefined
    Search: { brandId?: number; keyword?: string } | undefined
    Publish: undefined
    Mine: undefined
}

// Stack 导航参数
export type RootStackParamList = {
    MainTabs: NavigatorScreenParams<RootTabParamList>
    CarDetail: { carId: number }
    Search: { brandId?: number; keyword?: string }
    Login: undefined
    MyCars: undefined
    MyOrders: undefined
    MyFavorites: undefined
    Settings: undefined
}

// Screen Props 类型
export type RootStackScreenProps<T extends keyof RootStackParamList> =
    NativeStackScreenProps<RootStackParamList, T>

export type RootTabScreenProps<T extends keyof RootTabParamList> =
    CompositeScreenProps<
        BottomTabScreenProps<RootTabParamList, T>,
        NativeStackScreenProps<RootStackParamList>
    >

// 声明全局导航类型
declare global {
    namespace ReactNavigation {
        interface RootParamList extends RootStackParamList { }
    }
}
