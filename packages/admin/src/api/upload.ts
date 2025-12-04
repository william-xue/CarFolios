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
