<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Download, InfoFilled, Check } from '@element-plus/icons-vue'
import { useLocale } from '@/composables/useLocale'
import {
    templates,
    templateCategories,
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
        width="680px"
        :close-on-click-modal="false"
        class="poster-modal"
        destroy-on-close
    >
        <div class="poster-content">
            <div class="poster-layout">
                <!-- 左侧：模板选择 -->
                <div class="template-panel">
                    <div class="panel-header">
                        <span class="panel-title">{{ t('poster.selectTemplate') }}</span>
                    </div>
                    
                    <div class="template-categories">
                        <div 
                            v-for="category in templateCategories" 
                            :key="category.id"
                            class="category-section"
                        >
                            <div class="category-header">
                                <span class="category-name">{{ category.name }}</span>
                            </div>
                            <div class="template-list">
                                <div
                                    v-for="template in category.templates"
                                    :key="template.id"
                                    class="template-item"
                                    :class="{ active: selectedTemplate.id === template.id }"
                                    @click="selectTemplate(template)"
                                >
                                    <div 
                                        class="template-color"
                                        :style="{
                                            background: `linear-gradient(135deg, ${template.gradientStart || template.backgroundColor}, ${template.gradientEnd || template.backgroundColor})`
                                        }"
                                    >
                                        <div class="color-accent" :style="{ background: template.accentColor }"></div>
                                    </div>
                                    <span class="template-name">{{ template.name }}</span>
                                    <el-icon v-if="selectedTemplate.id === template.id" class="check-icon">
                                        <Check />
                                    </el-icon>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 右侧：海报预览 -->
                <div class="preview-panel">
                    <div class="preview-container" v-loading="loading" :element-loading-text="t('poster.generating')">
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
    max-height: 75vh;
    overflow-y: auto;
}

.poster-layout {
    display: flex;
    min-height: 500px;
}

.template-panel {
    width: 220px;
    background: #fafafa;
    border-right: 1px solid #f0f0f0;
    flex-shrink: 0;
}

.panel-header {
    padding: 16px 16px 12px;
    border-bottom: 1px solid #f0f0f0;
}

.panel-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
}

.template-categories {
    padding: 8px 0;
    max-height: calc(75vh - 140px);
    overflow-y: auto;
}

.category-section {
    margin-bottom: 8px;
}

.category-header {
    padding: 8px 16px 6px;
}

.category-name {
    font-size: 12px;
    color: #999;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.template-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.template-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    
    &:hover {
        background: rgba(0, 0, 0, 0.04);
    }
    
    &.active {
        background: rgba(var(--el-color-primary-rgb), 0.08);
        
        .template-name {
            color: var(--el-color-primary);
            font-weight: 600;
        }
    }
}

.template-color {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    flex-shrink: 0;
    position: relative;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.color-accent {
    position: absolute;
    bottom: 4px;
    left: 4px;
    width: 12px;
    height: 4px;
    border-radius: 2px;
}

.template-name {
    font-size: 13px;
    color: #333;
    flex: 1;
    transition: all 0.2s;
}

.check-icon {
    color: var(--el-color-primary);
    font-size: 16px;
}

.preview-panel {
    flex: 1;
    padding: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 100%);
}

.preview-container {
    width: 100%;
    max-width: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 450px;
}

.poster-image {
    max-width: 100%;
    max-height: 500px;
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
    margin: 16px 24px;
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

// 响应式适配
@media (max-width: 768px) {
    .poster-layout {
        flex-direction: column;
    }
    
    .template-panel {
        width: 100%;
        border-right: none;
        border-bottom: 1px solid #f0f0f0;
    }
    
    .template-categories {
        max-height: 200px;
    }
    
    .template-list {
        flex-direction: row;
        flex-wrap: wrap;
        padding: 0 12px;
    }
    
    .template-item {
        width: calc(50% - 4px);
        padding: 8px 12px;
    }
}
</style>
