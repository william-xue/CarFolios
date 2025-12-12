import request from './request'

// 上传单张图片
export function uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

// 上传多张图片
export function uploadImages(files: File[]): Promise<{ urls: string[] }> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    return request.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}

export function uploadFile(
    file: File,
    options?: { onProgress?: (percent: number) => void }
): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    return request.post('/upload/file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent: any) => {
            if (options?.onProgress && progressEvent.total) {
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                options.onProgress(percent)
            }
        },
    })
}
