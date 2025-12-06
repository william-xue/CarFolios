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
