import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        redirect: '/home',
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页' },
    },
    {
        path: '/search',
        name: 'Search',
        component: () => import('@/views/car/search.vue'),
        meta: { title: '搜索' },
    },
    {
        path: '/car/:id',
        name: 'CarDetail',
        component: () => import('@/views/car/detail.vue'),
        meta: { title: '车辆详情' },
    },
    {
        path: '/publish',
        name: 'Publish',
        component: () => import('@/views/publish/index.vue'),
        meta: { title: '发布车源', requiresAuth: true },
    },
    {
        path: '/user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '我的' },
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/user/login.vue'),
        meta: { title: '登录' },
    },
    {
        path: '/my-cars',
        name: 'MyCars',
        component: () => import('@/views/user/my-cars.vue'),
        meta: { title: '我的车源', requiresAuth: true },
    },
    {
        path: '/my-orders',
        name: 'MyOrders',
        component: () => import('@/views/user/my-orders.vue'),
        meta: { title: '我的订单', requiresAuth: true },
    },
    {
        path: '/payment/:orderId',
        name: 'Payment',
        component: () => import('@/views/payment/index.vue'),
        meta: { title: '确认支付', requiresAuth: true },
    },
    {
        path: '/payment/result/:paymentId',
        name: 'PaymentResult',
        component: () => import('@/views/payment/result.vue'),
        meta: { title: '支付结果', requiresAuth: true },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _from, next) => {
    document.title = `${to.meta.title || '爱车出海'} - 爱车出海二手车`
    next()
})

export default router
