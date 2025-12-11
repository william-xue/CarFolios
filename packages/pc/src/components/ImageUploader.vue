<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/api/upload'
import { Plus, Loading, Delete, ZoomIn, RefreshRight } from '@element-plus/icons-vue'
import type { ImageItem, ImageStatus } from '@/types'

const props = withDefaults(
    defineProps<{
        modelValue?: string[] | ImageItem[]
        limit?: number
        accept?: string
        editMode?: boolean
    }>(),
    {
        modelValue: () => [],
        limit: 9,
        accept: 'image/jpeg,image/png,image/webp',
        editMode: false,
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void
}>()

// 内部图片列表
const images = ref<ImageItem[]>([])

// 同步 props 到内部状态
watch(
    () => props.modelValue,
    (newVal) => {
        if (newVal && newVal.length > 0) {
            // 检查是否是字符串数组（URL 列表）
            const firstItem = newVal[0]
            if (typeof firstItem === 'string') {
                // 将字符串数组转换为 ImageItem 数组
                images.value = (newVal as string[]).filter(url => url).map((url, index) => ({
                    id: `existing-${index}`,
                    url,
                    status: 'existing' as ImageStatus
                }))
            } else {
                // 已经是 ImageItem 数组
                images.value = [...(newVal as ImageItem[])]
            }
        } else {
            images.value = []
        }
    },
    { immediate: true, deep: true }
)

// 有效图片数量（不包括已删除的）
const validCount = computed(() =>
    images.value.filter(img => img.status !== 'deleted' && img.status !== 'failed').length
)

// 是否有正在上传的图片
const isUploading = computed(() =>
    images.value.some(img => img.status === 'uploading')
)

// 显示用的图片列表（不包括已删除的）
const displayImages = computed(() =>
    images.value.filter(img => img.status !== 'deleted')
)

// 上传前检查
function beforeUpload(file: File): boolean {
    const isImage = props.accept.split(',').some((type) => file.type === type.trim())
    if (!isImage) {
        ElMessage.error('只能上传 JPG/PNG/WEBP 格式的图片')
        return false
    }

    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
        ElMessage.error('图片大小不能超过 5MB')
        return false
    }

    if (validCount.value >= props.limit) {
        ElMessage.error(`最多上传 ${props.limit} 张图片`)
        return false
    }

    return true
}

// 处理文件选择
async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement
    if (!input.files || input.files.length === 0) return

    const files = Array.from(input.files)
    for (const file of files) {
        if (!beforeUpload(file)) continue
        if (validCount.value >= props.limit) break

        // 添加图片到列表
        const item: ImageItem = {
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: URL.createObjectURL(file),
            status: 'uploading',
            file,
            message: '上传中...'
        }
        images.value.push(item)
        emitUpdate()

        // 上传图片
        try {
            const result = await uploadImage(file)
            const index = images.value.findIndex(img => img.id === item.id)
            if (index !== -1) {
                images.value[index] = {
                    ...images.value[index],
                    url: result.url,
                    status: 'done',
                    message: ''
                }
                emitUpdate()
            }
        } catch (error: any) {
            const index = images.value.findIndex(img => img.id === item.id)
            if (index !== -1) {
                images.value[index] = {
                    ...images.value[index],
                    status: 'failed',
                    message: error.message || '上传失败'
                }
                emitUpdate()
            }
            ElMessage.error(error.message || '上传失败')
        }
    }

    // 清空 input
    input.value = ''
}

// 删除图片
function handleDelete(item: ImageItem) {
    const index = images.value.findIndex(img => img.id === item.id)
    if (index === -1) return

    if (item.status === 'existing') {
        // 已有图片标记为删除
        images.value[index] = { ...item, status: 'deleted' }
    } else {
        // 新上传的图片直接移除
        if (item.url && item.url.startsWith('blob:')) {
            URL.revokeObjectURL(item.url)
        }
        images.value.splice(index, 1)
    }
    emitUpdate()
}

// 恢复已删除的图片
function handleRestore(item: ImageItem) {
    const index = images.value.findIndex(img => img.id === item.id)
    if (index !== -1) {
        images.value[index] = { ...item, status: 'existing' }
        emitUpdate()
    }
}

// 预览图片
const previewVisible = ref(false)
const previewUrl = ref('')
const previewIndex = ref(0)

function handlePreview(item: ImageItem) {
    previewUrl.value = item.url
    previewIndex.value = displayImages.value.findIndex(img => img.id === item.id)
    previewVisible.value = true
}

// 获取预览图片列表
const previewList = computed(() => displayImages.value.map(img => img.url))

// 发送更新事件 - 输出有效图片的 URL 列表
function emitUpdate() {
    // 只输出有效图片（非删除、非失败）的 URL
    const validUrls = images.value
        .filter(img => img.status !== 'deleted' && img.status !== 'failed' && img.status !== 'uploading')
        .map(img => img.url)
    emit('update:modelValue', validUrls)
}

// 清理 blob URLs
onUnmounted(() => {
    for (const img of images.value) {
        if (img.url && img.url.startsWith('blob:')) {
            URL.revokeObjectURL(img.url)
        }
    }
})

// 暴露方法给父组件
defineExpose({
    getSubmitData: () => {
        const kept: string[] = []
        const added: string[] = []
        const deleted: string[] = []

        for (const img of images.value) {
            switch (img.status) {
                case 'existing':
                    kept.push(img.url)
                    break
                case 'done':
                    added.push(img.url)
                    break
                case 'deleted':
                    deleted.push(img.url)
                    break
            }
        }

        return { kept, added, deleted, all: [...kept, ...added] }
    },
    initImages: (urls: string[]) => {
        images.value = urls.filter(url => url).map((url, index) => ({
            id: `existing-${index}`,
            url,
            status: 'existing' as ImageStatus
        }))
    },
    validCount,
    isUploading
})
</script>

<template>
    <div class="image-uploader" role="region" aria-label="图片上传区域">
        <div class="image-list">
            <!-- 图片项 -->
            <div
                v-for="item in displayImages"
                :key="item.id"
                class="image-item"
                :class="{
                    'is-uploading': item.status === 'uploading',
                    'is-failed': item.status === 'failed',
                    'is-existing': item.status === 'existing'
                }"
            >
                <img :src="item.url" alt="车辆图片" />
                
                <!-- 上传中遮罩 -->
                <div v-if="item.status === 'uploading'" class="image-mask uploading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                    <span>上传中...</span>
                </div>
                
                <!-- 上传失败遮罩 -->
                <div v-if="item.status === 'failed'" class="image-mask failed">
                    <span>{{ item.message || '上传失败' }}</span>
                </div>
                
                <!-- 操作按钮 -->
                <div class="image-actions">
                    <el-icon @click="handlePreview(item)"><ZoomIn /></el-icon>
                    <el-icon @click="handleDelete(item)"><Delete /></el-icon>
                </div>
                
                <!-- 已有图片标记 -->
                <div v-if="item.status === 'existing' && editMode" class="image-badge">已有</div>
            </div>
            
            <!-- 已删除图片（仅编辑模式显示） -->
            <div
                v-for="item in images.filter(img => img.status === 'deleted')"
                v-if="editMode"
                :key="'deleted-' + item.id"
                class="image-item is-deleted"
            >
                <img :src="item.url" alt="已删除图片" />
                <div class="image-mask deleted">
                    <span>已删除</span>
                    <el-button size="small" @click="handleRestore(item)">
                        <el-icon><RefreshRight /></el-icon>
                        恢复
                    </el-button>
                </div>
            </div>
            
            <!-- 上传按钮 -->
            <div
                v-if="validCount < limit"
                class="image-add"
                role="button"
                :aria-label="isUploading ? '正在上传图片' : `点击上传图片，已上传${validCount}张，最多${limit}张`"
            >
                <input
                    type="file"
                    :accept="accept"
                    multiple
                    @change="handleFileSelect"
                    :disabled="isUploading"
                />
                <el-icon v-if="!isUploading"><Plus /></el-icon>
                <el-icon v-else class="is-loading"><Loading /></el-icon>
                <span>{{ validCount }}/{{ limit }}</span>
            </div>
        </div>
        
        <div class="upload-tip">
            支持 JPG/PNG/WEBP 格式，单张不超过 5MB，最多上传 {{ limit }} 张
        </div>

        <!-- 图片预览 -->
        <el-image-viewer
            v-if="previewVisible"
            :url-list="previewList"
            :initial-index="previewIndex"
            @close="previewVisible = false"
        />
    </div>
</template>

<style lang="scss" scoped>
.image-uploader {
    width: 100%;
}

.image-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.image-item {
    position: relative;
    width: 104px;
    height: 104px;
    border-radius: 6px;
    overflow: hidden;
    background: #f5f7fa;
    border: 1px solid #dcdfe6;
    
    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    &.is-uploading img,
    &.is-failed img,
    &.is-deleted img {
        opacity: 0.5;
    }
    
    &:hover .image-actions {
        opacity: 1;
    }
}

.image-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #fff;
    font-size: 12px;
    
    &.uploading {
        background: rgba(0, 0, 0, 0.5);
    }
    
    &.failed {
        background: rgba(245, 108, 108, 0.8);
    }
    
    &.deleted {
        background: rgba(0, 0, 0, 0.6);
    }
}

.image-actions {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.2s;
    
    .el-icon {
        font-size: 20px;
        color: #fff;
        cursor: pointer;
        
        &:hover {
            color: #409eff;
        }
    }
}

.image-badge {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(64, 158, 255, 0.9);
    color: #fff;
    font-size: 12px;
    text-align: center;
    padding: 2px 0;
}

.image-add {
    position: relative;
    width: 104px;
    height: 104px;
    border: 1px dashed #dcdfe6;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #909399;
    cursor: pointer;
    background: #fafafa;
    transition: border-color 0.2s;
    
    &:hover {
        border-color: #409eff;
        color: #409eff;
    }
    
    input {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
    }
    
    .el-icon {
        font-size: 28px;
    }
    
    span {
        font-size: 12px;
    }
}

.upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
}

.is-loading {
    animation: rotating 2s linear infinite;
}

@keyframes rotating {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>
