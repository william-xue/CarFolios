<script setup lang="ts">
import { ref, computed } from 'vue'
import { Share, Link, ChatDotRound, Picture } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useLocale } from '@/composables/useLocale'
import PosterModal from './PosterModal.vue'
import type { CarInfo } from '@/utils/posterTemplates'

const { t } = useLocale()

// 分享平台类型
type SharePlatform = 'copy' | 'wechat' | 'weibo' | 'qq'

// 分享选项接口
interface ShareOption {
    key: SharePlatform
    label: string
    icon: string
}

const props = defineProps<{
    title: string
    image?: string
    description?: string
    url?: string
    // 海报生成需要的完整车辆信息
    carData?: CarInfo
}>()

const emit = defineEmits<{
    (e: 'share', platform: SharePlatform): void
}>()

const visible = ref(false)

// 当前分享 URL，支持自定义或使用当前页面 URL
const shareUrl = computed(() => props.url || window.location.href)

// 生成分享内容
const shareContent = computed(() => ({
    title: props.title,
    description: props.description || '',
    image: props.image || '',
    url: shareUrl.value
}))

// 检测是否支持原生分享 API
const supportsNativeShare = computed(() => {
    return typeof navigator !== 'undefined' && 'share' in navigator
})

// 检测是否为移动端
const isMobile = computed(() => {
    if (typeof window === 'undefined') return false
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
})

// 复制链接 - 兼容多种浏览器环境
async function copyLink(): Promise<boolean> {
    try {
        // 优先使用 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(shareUrl.value)
        } else {
            // 降级方案：使用 execCommand
            const textArea = document.createElement('textarea')
            textArea.value = shareUrl.value
            textArea.style.position = 'fixed'
            textArea.style.left = '-9999px'
            textArea.style.top = '-9999px'
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            const successful = document.execCommand('copy')
            document.body.removeChild(textArea)
            if (!successful) {
                throw new Error('execCommand copy failed')
            }
        }
        ElMessage.success(t('share.copySuccess') || '链接已复制到剪贴板')
        visible.value = false
        emit('share', 'copy')
        return true
    } catch (err) {
        console.error('Copy failed:', err)
        ElMessage.error(t('share.copyFailed') || '复制失败，请手动复制')
        return false
    }
}

// 使用原生分享 API（移动端）
async function nativeShare(): Promise<boolean> {
    if (!supportsNativeShare.value) {
        return false
    }
    
    try {
        const shareData: ShareData = {
            title: `【CarFolios】${props.title}`,
            text: props.description || props.title,
            url: shareUrl.value
        }
        
        await navigator.share(shareData)
        visible.value = false
        return true
    } catch (err) {
        // 用户取消分享不算错误
        if ((err as Error).name !== 'AbortError') {
            console.error('Native share failed:', err)
        }
        return false
    }
}

// 分享到微博
function shareToWeibo(): void {
    const url = encodeURIComponent(shareUrl.value)
    const title = encodeURIComponent(`【CarFolios】${props.title}`)
    const pic = props.image ? encodeURIComponent(props.image) : ''
    const summary = props.description ? encodeURIComponent(props.description) : ''
    
    window.open(
        `http://service.weibo.com/share/share.php?url=${url}&title=${title}&pic=${pic}&summary=${summary}`,
        '_blank',
        'width=600,height=500'
    )
    visible.value = false
    emit('share', 'weibo')
}

// 分享到 QQ
function shareToQQ(): void {
    const url = encodeURIComponent(shareUrl.value)
    const title = encodeURIComponent(`【CarFolios】${props.title}`)
    const summary = encodeURIComponent(props.description || props.title)
    const pics = props.image ? encodeURIComponent(props.image) : ''
    
    window.open(
        `https://connect.qq.com/widget/shareqq/index.html?url=${url}&title=${title}&summary=${summary}&pics=${pics}`,
        '_blank',
        'width=600,height=500'
    )
    visible.value = false
    emit('share', 'qq')
}

// 分享到微信（显示提示，因为微信需要扫码或在微信内分享）
async function shareToWechat(): Promise<void> {
    // 移动端尝试使用原生分享
    if (isMobile.value && supportsNativeShare.value) {
        await nativeShare()
        return
    }
    
    // PC 端提示用户复制链接后在微信中分享
    ElMessage.info(t('share.wechatTip') || '请复制链接后在微信中分享给好友')
    await copyLink()
    emit('share', 'wechat')
}

// 统一分享入口
async function shareToSocial(platform: SharePlatform): Promise<void> {
    switch (platform) {
        case 'copy':
            await copyLink()
            break
        case 'weibo':
            shareToWeibo()
            break
        case 'qq':
            shareToQQ()
            break
        case 'wechat':
            shareToWechat()
            break
    }
}

// 海报弹窗状态
const posterModalVisible = ref(false)

// 生成海报
function generatePoster(): void {
    if (!props.carData) {
        ElMessage.warning(t('poster.noCarData') || '缺少车辆信息')
        return
    }
    visible.value = false
    posterModalVisible.value = true
}

// 海报生成完成
function onPosterGenerated(): void {
    // 可以添加统计等逻辑
}

// 海报下载完成
function onPosterDownloaded(): void {
    // 可以添加统计等逻辑
}

// 暴露方法供外部调用
defineExpose({
    copyLink,
    shareToWeibo,
    shareToQQ,
    shareToWechat,
    shareToSocial,
    shareContent,
    supportsNativeShare
})
</script>

<template>
    <el-popover
        v-model:visible="visible"
        placement="bottom"
        :width="320"
        trigger="click"
    >
        <template #reference>
            <el-button class="share-btn" circle>
                <el-icon><Share /></el-icon>
            </el-button>
        </template>

        <div class="share-panel">
            <h3 class="share-title">{{ t('share.title') || '分享车源' }}</h3>
            <div class="share-grid">
                <!-- 复制链接 -->
                <div class="share-item" @click="copyLink" data-testid="share-copy">
                    <div class="icon-wrapper link">
                        <el-icon><Link /></el-icon>
                    </div>
                    <span>{{ t('share.copyLink') || '复制链接' }}</span>
                </div>
                <!-- 微信分享 -->
                <div class="share-item" @click="shareToWechat" data-testid="share-wechat">
                    <div class="icon-wrapper wechat">
                        <el-icon><ChatDotRound /></el-icon>
                    </div>
                    <span>{{ t('share.wechat') || '微信' }}</span>
                </div>
                <!-- 微博分享 -->
                <div class="share-item" @click="shareToWeibo" data-testid="share-weibo">
                    <div class="icon-wrapper weibo">
                        <span class="weibo-icon">W</span>
                    </div>
                    <span>{{ t('share.weibo') || '微博' }}</span>
                </div>
                <!-- QQ 分享 -->
                <div class="share-item" @click="shareToQQ" data-testid="share-qq">
                    <div class="icon-wrapper qq">
                        <span class="qq-icon">Q</span>
                    </div>
                    <span>{{ t('share.qq') || 'QQ' }}</span>
                </div>
                <!-- 生成海报 -->
                <div class="share-item" @click="generatePoster" data-testid="share-poster">
                    <div class="icon-wrapper poster">
                        <el-icon><Picture /></el-icon>
                    </div>
                    <span>{{ t('share.poster') || '生成海报' }}</span>
                </div>
            </div>
            <!-- 移动端原生分享提示 -->
            <div v-if="isMobile && supportsNativeShare" class="native-share-tip">
                <el-button type="primary" size="small" @click="nativeShare" data-testid="share-native">
                    {{ t('share.nativeShare') || '使用系统分享' }}
                </el-button>
            </div>
        </div>
    </el-popover>

    <!-- 海报生成弹窗 -->
    <PosterModal
        v-model:visible="posterModalVisible"
        :car="carData || null"
        @generated="onPosterGenerated"
        @downloaded="onPosterDownloaded"
    />
</template>

<style lang="scss" scoped>
.share-panel {
    padding: 8px;
}

.share-title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    text-align: center;
    color: $text-primary;
}

.share-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
}

.share-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    
    span {
        font-size: 12px;
        color: $text-regular;
    }
    
    &:hover {
        .icon-wrapper {
            transform: translateY(-2px);
            box-shadow: $box-shadow-sm;
        }
        span {
            color: $primary-color;
        }
    }
}

.icon-wrapper {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $bg-color;
    transition: all 0.2s;
    font-size: 20px;
    
    &.link {
        color: $primary-color;
        background: rgba($primary-color, 0.1);
    }
    
    &.weibo {
        color: #e6162d;
        background: rgba(230, 22, 45, 0.1);
        
        .weibo-icon {
            font-weight: bold;
            font-style: normal;
        }
    }
    
    &.wechat {
        color: #07c160;
        background: rgba(7, 193, 96, 0.1);
    }
    
    &.qq {
        color: #12b7f5;
        background: rgba(18, 183, 245, 0.1);
        
        .qq-icon {
            font-weight: bold;
            font-style: normal;
        }
    }
    
    &.poster {
        color: $warning-color;
        background: rgba($warning-color, 0.1);
    }
}

.native-share-tip {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid $border-color;
    text-align: center;
}
</style>
