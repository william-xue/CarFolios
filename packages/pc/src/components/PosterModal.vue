<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, InfoFilled } from '@element-plus/icons-vue'
import { useLocale } from '@/composables/useLocale'
import {
    templates,
    renderPoster,
    type CarInfo,
    type PosterTemplate
} from '@/utils/posterTemplates'
import { generatePosterFilename } from '@/utils/posterUtils'

const props = defineProps<{
    visible: boolean
    car: CarInfo | null
}>()

const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'generated'): void
    (e: 'downloaded'): void
}>()

const { t } = useLocale()

const dialogVisible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val)
})

const selectedTemplate = ref<PosterTemplate>(templates[0])
const posterDataUrl = ref<string>('')
const loading = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
    isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    )
}

const generatePoster = async () => {
    if (!props.car) return
    loading.value = true
    posterDataUrl.value = ''

    try {
        const dataUrl = await renderPoster({
            template: selectedTemplate.value,
            car: props.car
        })
        posterDataUrl.value = dataUrl
        emit('generated')
    } catch (error) {
        console.error('海报生成失败:', error)
        ElMessage.error(t('poster.generateFailed'))
    } finally {
        loading.value = false
    }
}

const selectTemplate = (template: PosterTemplate) => {
    selectedTemplate.value = template
    generatePoster()
}

const downloadPoster = async () => {
    if (!posterDataUrl.value || !props.car) return

    try {
        const filename = generatePosterFilename(props.car.title)
        const link = document.createElement('a')
        link.href = posterDataUrl.value
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        ElMessage.success(t('poster.downloadSuccess'))
        emit('downloaded')
    } catch (error) {
        console.error('下载失败:', error)
        ElMessage.error(t('poster.downloadFailed'))
    }
}

watch(
    () => props.visible,
    (val) => {
        if (val && props.car) {
            checkMobile()
            generatePoster()
        }
    }
)
</script>

<template>
    <el-dialog
        v-model="dialogVisible"
        :title="t('poster.title')"
        width="520px"
        :close-on-click-modal="false"
        class="poster-modal"
        destroy-on-close
    >
        <div class="poster-content">
            <!-- 模板选择 -->
            <div class="template-section">
                <div class="section-header">
                    <span class="section-title">{{ t('poster.selectTemplate') }}</span>
                </div>
                <div class="template-grid">
                    <div
                        v-for="template in templates"
                        :key="template.id"
                        class="template-card"
                        :class="{ active: selectedTemplate.id === template.id }"
                        @click="selectTemplate(template)"
                    >
                        <div
                            class="template-preview"
                            :style="{
                                background: `linear-gradient(135deg, ${template.gradientStart || template.backgroundColor}, ${template.gradientEnd || template.backgroundColor})`
                            }"
                        >
                            <div class="preview-content">
                                <div class="preview-img" :style="{ background: template.id === 'luxury' ? '#333' : '#e0e0e0' }"></div>
                                <div class="preview-price" :style="{ background: template.accentColor }"></div>
                                <div class="preview-text" :style="{ background: template.textColor, opacity: 0.6 }"></div>
                                <div class="preview-qr" :style="{ background: template.id === 'luxury' ? '#fff' : '#333' }"></div>
                            </div>
                        </div>
                        <div class="template-info">
                            <span class="template-name">{{ template.name }}</span>
                            <span class="template-check" v-if="selectedTemplate.id === template.id">✓</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 海报预览 -->
            <div class="preview-section">
                <div class="preview-container" v-loading="loading" element-loading-text="生成中...">
                    <img
                        v-if="posterDataUrl"
                        :src="posterDataUrl"
                        alt="海报预览"
                        class="poster-image"
                    />
                    <div v-else-if="!loading" class="empty-state">
                        <span>{{ t('poster.generating') }}</span>
                    </div>
                </div>
            </div>

            <!-- 移动端提示 -->
            <div v-if="isMobile && posterDataUrl" class="mobile-hint">
                <el-icon><InfoFilled /></el-icon>
                <span>{{ t('poster.longPressToSave') }}</span>
            </div>
        </div>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="dialogVisible = false" size="large">
                    {{ t('common.cancel') }}
                </el-button>
                <el-button
                    type="primary"
                    size="large"
                    :disabled="!posterDataUrl || loading"
                    :icon="Download"
                    @click="downloadPoster"
                >
                    {{ t('poster.download') }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<style scoped lang="scss">
.poster-modal {
    :deep(.el-dialog) {
        border-radius: 16px;
        overflow: hidden;
    }
    
    :deep(.el-dialog__header) {
        padding: 20px 24px 16px;
        border-bottom: 1px solid #f0f0f0;
        margin-right: 0;
        
        .el-dialog__title {
            font-size: 18px;
            font-weight: 600;
        }
    }
    
    :deep(.el-dialog__body) {
        padding: 0;
    }
    
    :deep(.el-dialog__footer) {
        padding: 16px 24px 20px;
        border-top: 1px solid #f0f0f0;
    }
}

.poster-content {
    max-height: 70vh;
    overflow-y: auto;
}

.template-section {
    padding: 20px 24px;
    background: #fafafa;
    border-bottom: 1px solid #f0f0f0;
}

.section-header {
    margin-bottom: 16px;
}

.section-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
}

.template-grid {
    display: flex;
    gap: 16px;
}

.template-card {
    flex: 1;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        
        .template-preview {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }
    }
    
    &.active {
        .template-preview {
            border-color: var(--el-color-primary);
            box-shadow: 0 0 0 3px rgba(var(--el-color-primary-rgb), 0.15);
        }
        
        .template-name {
            color: var(--el-color-primary);
            font-weight: 600;
        }
    }
}

.template-preview {
    aspect-ratio: 9/16;
    border-radius: 12px;
    border: 2px solid transparent;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.preview-content {
    padding: 12px;
    height: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.preview-img {
    flex: 1;
    border-radius: 6px;
    min-height: 60px;
}

.preview-price {
    width: 50%;
    height: 12px;
    border-radius: 6px;
}

.preview-text {
    width: 80%;
    height: 8px;
    border-radius: 4px;
}

.preview-qr {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    align-self: flex-end;
}

.template-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 10px;
}

.template-name {
    font-size: 13px;
    color: #666;
    transition: all 0.2s;
}

.template-check {
    width: 18px;
    height: 18px;
    background: var(--el-color-primary);
    color: #fff;
    border-radius: 50%;
    font-size: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-section {
    padding: 24px;
    display: flex;
    justify-content: center;
    background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
    min-height: 400px;
}

.preview-container {
    width: 100%;
    max-width: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.poster-image {
    max-width: 100%;
    max-height: 480px;
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease;
    
    &:hover {
        transform: scale(1.02);
    }
}

.empty-state {
    color: #999;
    font-size: 14px;
    text-align: center;
}

.mobile-hint {
    margin: 0 24px 16px;
    padding: 12px 16px;
    background: linear-gradient(135deg, #fff7e6 0%, #fff2d9 100%);
    border-radius: 8px;
    color: #d48806;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    .el-icon {
        font-size: 16px;
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    
    .el-button {
        min-width: 100px;
    }
}
</style>
