import request from './request'

export interface UploadResult {
    url: string
    key: string
}

// 上传图片
export function uploadImage(file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
}

// 批量上传图片
export async function uploadImages(files: File[]): Promise<UploadResult[]> {
    const results: UploadResult[] = []
    for (const file of files) {
        const result = await uploadImage(file)
        results.push(result)
    }
    return results
}

// 上传文件（支持进度回调）
export function uploadFile(
    file: File,
    options?: { onProgress?: (percent: number) => void }
): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)

    return request.post('/upload/file', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
            if (options?.onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                options.onProgress(percent)
            }
        },
    })
}
