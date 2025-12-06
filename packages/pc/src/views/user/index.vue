<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useLocale } from '@/composables/useLocale'

const { t } = useLocale()
const router = useRouter()
const userStore = useUserStore()

const menuItems = computed(() => [
    { icon: 'Document', title: t('nav.myCars'), desc: t('nav.myCars'), path: '/my-cars' },
    { icon: 'List', title: t('nav.myOrders'), desc: t('nav.myOrders'), path: '/my-orders' },
    { icon: 'Star', title: t('user.myFavorites'), desc: t('user.myFavorites'), path: '/favorites', disabled: true },
    { icon: 'Clock', title: t('common.more'), desc: t('common.more'), path: '/history', disabled: true },
])

function goTo(path: string, disabled?: boolean) {
    if (disabled) return
    router.push(path)
}
</script>

<template>
    <div class="user-page">
        <div class="page-container">
            <!-- 用户信息卡片 -->
            <div class="user-card card">
                <div class="user-info">
                    <el-avatar :src="userStore.user?.avatar" :size="80" />
                    <div class="user-detail">
                        <h2 class="user-name">{{ userStore.user?.nickname || t('user.profile') }}</h2>
                        <p class="user-mobile">{{ userStore.user?.mobile }}</p>
                        <div class="user-tags">
                            <el-tag v-if="userStore.user?.isVerified" type="success" size="small">
                                已实名
                            </el-tag>
                            <el-tag v-else type="info" size="small">未实名</el-tag>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 功能菜单 -->
            <div class="menu-grid">
                <div
                    v-for="item in menuItems"
                    :key="item.path"
                    :class="['menu-item card', { disabled: item.disabled }]"
                    @click="goTo(item.path, item.disabled)"
                >
                    <el-icon :size="32" class="menu-icon">
                        <component :is="item.icon" />
                    </el-icon>
                    <div class="menu-content">
                        <h3 class="menu-title">{{ item.title }}</h3>
                        <p class="menu-desc">{{ item.desc }}</p>
                    </div>
                    <el-icon class="menu-arrow"><ArrowRight /></el-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.user-page {
    background: $bg-color-page;
    min-height: calc(100vh - $header-height - 100px);
}

.user-card {
    padding: 32px;
    margin-bottom: 24px;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 24px;
}

.user-detail {
    flex: 1;
}

.user-name {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 8px;
}

.user-mobile {
    font-size: 14px;
    color: $text-secondary;
    margin-bottom: 8px;
}

.user-tags {
    display: flex;
    gap: 8px;
}

.menu-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    @media (max-width: $breakpoint-md) {
        grid-template-columns: 1fr;
    }
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(.disabled) {
        box-shadow: $box-shadow-md;
        transform: translateY(-2px);
    }

    &.disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}

.menu-icon {
    color: $primary-color;
}

.menu-content {
    flex: 1;
}

.menu-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 4px;
}

.menu-desc {
    font-size: 12px;
    color: $text-secondary;
}

.menu-arrow {
    color: $text-placeholder;
}
</style>
