<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadImage } from '@/api/upload'
import type { UploadFile, UploadUserFile } from 'element-plus'

const props = withDefaults(
    defineProps<{
        modelValue?: string[]
        limit?: number
        accept?: string
    }>(),
    {
        modelValue: () => [],
        limit: 9,
        accept: 'image/jpeg,image/png,image/webp',
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void
}>()

const fileList = ref<UploadUserFile[]>(
    props.modelValue.map((url, index) => ({
        name: `image-${index}`,
        url,
        status: 'success',
    }))
)

const uploading = ref(false)

// 上传前检查
function beforeUpload(file: File) {
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

    return true
}

// 自定义上传
async function customUpload(options: { file: File; onSuccess: (res: any) => void; onError: (err: any) => void }) {
    uploading.value = true
    try {
        const result = await uploadImage(options.file)
        options.onSuccess(result)
        
        // 更新 modelValue
        const urls = [...props.modelValue, result.url]
        emit('update:modelValue', urls)
    } catch (error: any) {
        options.onError(error)
        ElMessage.error(error.message || '上传失败')
    } finally {
        uploading.value = false
    }
}

// 删除图片
function handleRemove(file: UploadFile) {
    const index = fileList.value.findIndex((f) => f.uid === file.uid)
    if (index > -1) {
        const urls = [...props.modelValue]
        urls.splice(index, 1)
        emit('update:modelValue', urls)
    }
}

// 预览图片
const previewVisible = ref(false)
const previewUrl = ref('')

function handlePreview(file: UploadFile) {
    previewUrl.value = file.url || ''
    previewVisible.value = true
}
</script>

<template>
    <div class="image-uploader" role="region" aria-label="图片上传区域">
        <el-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :accept="accept"
            :limit="limit"
            :before-upload="beforeUpload"
            :http-request="customUpload"
            :on-remove="handleRemove"
            :on-preview="handlePreview"
            :disabled="uploading"
        >
            <template #default>
                <div 
                    class="upload-trigger"
                    role="button"
                    :aria-label="uploading ? '正在上传图片' : `点击上传图片，已上传${fileList.length}张，最多${limit}张`"
                    :aria-busy="uploading"
                >
                    <el-icon v-if="!uploading" aria-hidden="true"><Plus /></el-icon>
                    <el-icon v-else class="is-loading" aria-hidden="true"><Loading /></el-icon>
                    <span class="upload-text">{{ uploading ? '上传中' : '上传图片' }}</span>
                </div>
            </template>
            <template #tip>
                <div class="upload-tip" id="upload-hint">
                    支持 JPG/PNG/WEBP 格式，单张不超过 5MB，最多上传 {{ limit }} 张
                </div>
            </template>
        </el-upload>

        <!-- 图片预览 -->
        <el-image-viewer
            v-if="previewVisible"
            :url-list="[previewUrl]"
            @close="previewVisible = false"
        />
    </div>
</template>

<style lang="scss" scoped>
.image-uploader {
    width: 100%;
}

.upload-trigger {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: $text-placeholder;
}

.upload-text {
    font-size: 12px;
}

.upload-tip {
    font-size: 12px;
    color: $text-secondary;
    margin-top: 8px;
}
</style>
