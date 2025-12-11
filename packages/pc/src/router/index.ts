import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'

NProgress.configure({ showSpinner: false })

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        component: () => import('@/layouts/DefaultLayout.vue'),
        children: [
            {
                path: '',
                name: 'Home',
                component: () => import('@/views/home/index.vue'),
                meta: { title: '首页' },
            },
            {
                path: 'search',
                name: 'Search',
                component: () => import('@/views/search/index.vue'),
                meta: { title: '搜索' },
            },
            {
                path: 'car/:id',
                name: 'CarDetail',
                component: () => import('@/views/car/detail.vue'),
                meta: { title: '车辆详情' },
            },
            {
                path: 'publish',
                name: 'Publish',
                component: () => import('@/views/publish/index.vue'),
                meta: { title: '发布车源', requiresAuth: true },
            },
            {
                path: 'user',
                name: 'UserCenter',
                component: () => import('@/views/user/index.vue'),
                meta: { title: '个人中心', requiresAuth: true },
            },
            {
                path: 'my-cars',
                name: 'MyCars',
                component: () => import('@/views/user/my-cars.vue'),
                meta: { title: '我的车源', requiresAuth: true },
            },
            {
                path: 'my-orders',
                name: 'MyOrders',
                component: () => import('@/views/user/my-orders.vue'),
                meta: { title: '我的订单', requiresAuth: true },
            },
            {
                path: 'favorites',
                name: 'Favorites',
                component: () => import('@/views/user/favorites.vue'),
                meta: { title: '我的收藏', requiresAuth: true },
            },
            {
                path: 'car/edit/:id',
                name: 'CarEdit',
                component: () => import('@/views/car/edit.vue'),
                meta: { title: '编辑车源', requiresAuth: true },
            },
        ],
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/user/login.vue'),
        meta: { title: '登录' },
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/error/404.vue'),
        meta: { title: '页面不存在' },
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(_to, _from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        }
        return { top: 0 }
    },
})

// 路由守卫
router.beforeEach((to, _from, next) => {
    NProgress.start()

    // 设置页面标题
    document.title = `${to.meta.title || 'CarFolios'} - 二手车信息发布平台`

    // 检查是否需要登录
    if (to.meta.requiresAuth) {
        const userStore = useUserStore()
        if (!userStore.isLoggedIn) {
            next({ name: 'Login', query: { redirect: to.fullPath } })
            return
        }
    }

    next()
})

router.afterEach(() => {
    NProgress.done()
})

export default router
