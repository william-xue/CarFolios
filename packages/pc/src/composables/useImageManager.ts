import { ref, computed } from 'vue'

/**
 * 图片项状态
 */
export type ImageStatus = 'existing' | 'uploading' | 'done' | 'failed' | 'deleted'

/**
 * 图片项接口
 */
export interface ImageItem {
    id?: number | string
    url: string
    status: ImageStatus
    file?: File
    message?: string
}

/**
 * 提交数据接口
 */
export interface ImageSubmitData {
    /** 保留的已有图片 */
    kept: string[]
    /** 新增的图片 */
    added: string[]
    /** 删除的图片 */
    deleted: string[]
    /** 所有有效图片（kept + added） */
    all: string[]
}

/**
 * 图片状态管理 Hook
 * 用于处理编辑模式下的图片回显、新增、删除等操作
 */
export function useImageManager(initialImages: string[] = []) {
    // 图片列表
    const images = ref<ImageItem[]>(
        initialImages.map((url, index) => ({
            id: index,
            url,
            status: 'existing' as ImageStatus
        }))
    )

    // 有效图片数量（不包括已删除的）
    const validCount = computed(() =>
        images.value.filter(img => img.status !== 'deleted' && img.status !== 'failed').length
    )

    // 是否有正在上传的图片
    const isUploading = computed(() =>
        images.value.some(img => img.status === 'uploading')
    )


    /**
     * 初始化图片列表（用于编辑模式）
     */
    function initImages(urls: string[]) {
        images.value = urls.map((url, index) => ({
            id: index,
            url,
            status: 'existing' as ImageStatus
        }))
    }

    /**
     * 添加新图片（上传中状态）
     */
    function addImage(file: File): ImageItem {
        const item: ImageItem = {
            id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: URL.createObjectURL(file),
            status: 'uploading',
            file,
            message: '上传中...'
        }
        images.value.push(item)
        return item
    }

    /**
     * 更新图片状态
     */
    function updateImage(id: number | string, updates: Partial<ImageItem>) {
        const index = images.value.findIndex(img => img.id === id)
        if (index !== -1) {
            images.value[index] = { ...images.value[index], ...updates }
        }
    }

    /**
     * 标记图片上传成功
     */
    function markDone(id: number | string, url: string) {
        updateImage(id, { url, status: 'done', message: '' })
    }

    /**
     * 标记图片上传失败
     */
    function markFailed(id: number | string, message = '上传失败') {
        updateImage(id, { status: 'failed', message })
    }

    /**
     * 删除图片
     * - 已有图片：标记为 deleted
     * - 新上传的图片：直接移除
     */
    function deleteImage(id: number | string) {
        const index = images.value.findIndex(img => img.id === id)
        if (index === -1) return

        const item = images.value[index]

        if (item.status === 'existing') {
            // 已有图片标记为删除
            images.value[index] = { ...item, status: 'deleted' }
        } else {
            // 新上传的图片直接移除
            // 释放 blob URL
            if (item.url.startsWith('blob:')) {
                URL.revokeObjectURL(item.url)
            }
            images.value.splice(index, 1)
        }
    }

    /**
     * 恢复已删除的图片
     */
    function restoreImage(id: number | string) {
        updateImage(id, { status: 'existing' })
    }

    /**
     * 获取提交数据
     */
    function getSubmitData(): ImageSubmitData {
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

        return {
            kept,
            added,
            deleted,
            all: [...kept, ...added]
        }
    }

    /**
     * 清空所有图片
     */
    function clearAll() {
        // 释放所有 blob URL
        for (const img of images.value) {
            if (img.url.startsWith('blob:')) {
                URL.revokeObjectURL(img.url)
            }
        }
        images.value = []
    }

    /**
     * 获取显示用的图片列表（不包括已删除的）
     */
    const displayImages = computed(() =>
        images.value.filter(img => img.status !== 'deleted')
    )

    return {
        images,
        displayImages,
        validCount,
        isUploading,
        initImages,
        addImage,
        updateImage,
        markDone,
        markFailed,
        deleteImage,
        restoreImage,
        getSubmitData,
        clearAll
    }
}

export default useImageManager
