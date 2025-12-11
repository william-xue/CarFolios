/**
 * 视频文件验证工具
 */

export interface ValidationResult {
    valid: boolean
    message?: string
}

// 允许的视频格式
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo']
// 最大文件大小 100MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024

/**
 * 验证视频文件
 * @param file 文件对象
 * @returns 验证结果
 */
export function validateVideoFile(file: File): ValidationResult {
    // 格式验证
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        return {
            valid: false,
            message: '仅支持 MP4、AVI、MOV 格式的视频'
        }
    }

    // 大小验证
    if (file.size > MAX_VIDEO_SIZE) {
        return {
            valid: false,
            message: '视频文件不能超过100MB'
        }
    }

    return { valid: true }
}

/**
 * 验证图片文件
 * @param file 文件对象
 * @returns 验证结果
 */
export function validateImageFile(file: File): ValidationResult {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            message: '仅支持 JPG、PNG、GIF、WebP 格式的图片'
        }
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            message: '图片文件不能超过10MB'
        }
    }

    return { valid: true }
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的字符串
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * VIN 验证（17位字母数字，排除 I/O/Q）
 */
export function validateVin(vin: string): { valid: boolean; message?: string } {
    if (!vin) {
        return { valid: false, message: 'VIN码不能为空' }
    }

    // 转大写处理
    const upperVin = vin.toUpperCase()

    // 长度检查
    if (upperVin.length !== 17) {
        return { valid: false, message: 'VIN码必须为17位' }
    }

    // 字符检查：只允许字母和数字，排除 I/O/Q
    const validPattern = /^[A-HJ-NPR-Z0-9]{17}$/
    if (!validPattern.test(upperVin)) {
        return { valid: false, message: 'VIN码只能包含字母和数字，且不能包含I、O、Q' }
    }

    return { valid: true }
}

/**
 * 手机号验证（11位中国大陆手机号）
 */
export function validatePhone(phone: string): { valid: boolean; message?: string } {
    if (!phone) {
        return { valid: false, message: '手机号不能为空' }
    }

    // 中国大陆手机号正则
    const phonePattern = /^1[3-9]\d{9}$/
    if (!phonePattern.test(phone)) {
        return { valid: false, message: '请输入正确的11位手机号' }
    }

    return { valid: true }
}

/**
 * 价格验证
 */
export function validatePrice(price: number | string): { valid: boolean; message?: string } {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price

    if (isNaN(numPrice)) {
        return { valid: false, message: '请输入有效的价格' }
    }

    if (numPrice < 0) {
        return { valid: false, message: '价格不能为负数' }
    }

    if (numPrice > 99999999) {
        return { valid: false, message: '价格超出有效范围' }
    }

    return { valid: true }
}

/**
 * 里程验证
 */
export function validateMileage(mileage: number | string): { valid: boolean; message?: string } {
    const numMileage = typeof mileage === 'string' ? parseFloat(mileage) : mileage

    if (isNaN(numMileage)) {
        return { valid: false, message: '请输入有效的里程数' }
    }

    if (numMileage < 0) {
        return { valid: false, message: '里程数不能为负数' }
    }

    if (numMileage > 9999999) {
        return { valid: false, message: '里程数超出有效范围' }
    }

    return { valid: true }
}

/**
 * 年份验证
 */
export function validateYear(year: number | string): { valid: boolean; message?: string } {
    const numYear = typeof year === 'string' ? parseInt(year, 10) : year
    const currentYear = new Date().getFullYear()

    if (isNaN(numYear)) {
        return { valid: false, message: '请输入有效的年份' }
    }

    if (numYear < 1990) {
        return { valid: false, message: '年份不能早于1990年' }
    }

    if (numYear > currentYear + 1) {
        return { valid: false, message: '年份不能超过明年' }
    }

    return { valid: true }
}
