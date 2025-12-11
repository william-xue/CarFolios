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
 * 验证 VIN 码
 * @param vin VIN码
 * @returns 验证结果
 */
export function validateVin(vin: string): ValidationResult {
    if (!vin) {
        return { valid: true } // VIN 是可选的
    }

    const cleanVin = vin.toUpperCase().trim()

    if (cleanVin.length !== 17) {
        return {
            valid: false,
            message: 'VIN码必须是17位'
        }
    }

    // VIN 不能包含 I、O、Q
    if (/[IOQ]/.test(cleanVin)) {
        return {
            valid: false,
            message: 'VIN码不能包含字母 I、O、Q'
        }
    }

    // 只能包含数字和字母
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin)) {
        return {
            valid: false,
            message: 'VIN码格式不正确'
        }
    }

    return { valid: true }
}

/**
 * 验证车牌号
 * @param plateNumber 车牌号
 * @returns 验证结果
 */
export function validatePlateNumber(plateNumber: string): ValidationResult {
    if (!plateNumber) {
        return { valid: true } // 车牌号是可选的
    }

    const cleanPlate = plateNumber.replace(/[\s·.]/g, '').toUpperCase()

    // 普通车牌：省份简称 + 字母 + 5位字母数字
    // 新能源车牌：省份简称 + 字母 + 6位字母数字
    const normalPattern = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{5}$/
    const newEnergyPattern = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{6}$/

    if (!normalPattern.test(cleanPlate) && !newEnergyPattern.test(cleanPlate)) {
        return {
            valid: false,
            message: '车牌号格式不正确'
        }
    }

    return { valid: true }
}

/**
 * 验证手机号
 * @param phone 手机号
 * @returns 验证结果
 */
export function validatePhone(phone: string): ValidationResult {
    if (!phone) {
        return { valid: true } // 手机号是可选的
    }

    const cleanPhone = phone.replace(/[\s-]/g, '')

    if (!/^1[3-9]\d{9}$/.test(cleanPhone)) {
        return {
            valid: false,
            message: '手机号格式不正确'
        }
    }

    return { valid: true }
}

/**
 * 验证价格
 * @param price 价格
 * @returns 验证结果
 */
export function validatePrice(price: number | null | undefined): ValidationResult {
    if (price === null || price === undefined) {
        return {
            valid: false,
            message: '请输入价格'
        }
    }

    if (price <= 0) {
        return {
            valid: false,
            message: '价格必须大于0'
        }
    }

    if (price > 99999999) {
        return {
            valid: false,
            message: '价格超出范围'
        }
    }

    return { valid: true }
}

/**
 * 验证里程数
 * @param mileage 里程数
 * @returns 验证结果
 */
export function validateMileage(mileage: number | null | undefined): ValidationResult {
    if (mileage === null || mileage === undefined) {
        return {
            valid: false,
            message: '请输入里程数'
        }
    }

    if (mileage < 0) {
        return {
            valid: false,
            message: '里程数不能为负数'
        }
    }

    if (mileage > 9999999) {
        return {
            valid: false,
            message: '里程数超出范围'
        }
    }

    return { valid: true }
}
