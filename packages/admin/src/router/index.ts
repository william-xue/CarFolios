import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { title: '登录', public: true },
    },
    {
        path: '/',
        component: () => import('@/layouts/DefaultLayout.vue'),
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/views/dashboard/index.vue'),
                meta: { title: '工作台', icon: 'Odometer' },
            },
            {
                path: 'cars',
                name: 'Cars',
                component: () => import('@/views/car/list.vue'),
                meta: { title: '车源管理', icon: 'Van' },
            },
            {
                path: 'cars/create',
                name: 'CreateCar',
                component: () => import('@/views/car/edit.vue'),
                meta: { title: '发布车源', hidden: true },
            },
            {
                path: 'cars/:id/edit',
                name: 'EditCar',
                component: () => import('@/views/car/edit.vue'),
                meta: { title: '编辑车源', hidden: true },
            },
            {
                path: 'cars/:id',
                name: 'CarDetail',
                component: () => import('@/views/car/detail.vue'),
                meta: { title: '车源详情', hidden: true },
            },
            {
                path: 'audit',
                name: 'Audit',
                component: () => import('@/views/audit/index.vue'),
                meta: { title: '审核中心', icon: 'Checked' },
            },
            {
                path: 'users',
                name: 'Users',
                component: () => import('@/views/user/list.vue'),
                meta: { title: '用户管理', icon: 'User' },
            },
            {
                path: 'orders',
                name: 'Orders',
                component: () => import('@/views/order/list.vue'),
                meta: { title: '订单管理', icon: 'List' },
            },
            {
                path: 'payments',
                name: 'Payments',
                component: () => import('@/views/payment/list.vue'),
                meta: { title: '支付管理', icon: 'Wallet' },
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 路由守卫
router.beforeEach((to, _from, next) => {
    // 设置页面标题
    document.title = `${to.meta.title || '车故'} - 车故二手车管理后台`

    const userStore = useUserStore()

    // 公开页面直接放行
    if (to.meta.public) {
        if (userStore.isLoggedIn && to.path === '/login') {
            next('/')
        } else {
            next()
        }
        return
    }

    // 需要登录的页面
    if (!userStore.isLoggedIn) {
        next('/login')
        return
    }

    next()
})

export default router
