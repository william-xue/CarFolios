/**
 * 车辆信息校验工具函数
 */

// VIN 校验结果
export interface VinValidationResult {
    isValid: boolean
    errorMessage?: string
}

// 车牌号校验结果
export interface PlateValidationResult {
    isValid: boolean
    errorMessage?: string
    plateType?: 'standard' | 'newEnergy' | 'special'
}

// VIN 校验正则：17位，A-H, J-N, P, R-Z, 0-9（不含 I, O, Q）
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/

// 中国省份简称
const PROVINCE_ABBREVIATIONS = [
    '京', '津', '沪', '渝', '冀', '豫', '云', '辽', '黑', '湘',
    '皖', '鲁', '新', '苏', '浙', '赣', '鄂', '桂', '甘', '晋',
    '蒙', '陕', '吉', '闽', '贵', '粤', '川', '青', '藏', '琼', '宁'
]

// 普通车牌正则：省份简称 + 字母 + 5位字母数字
const STANDARD_PLATE_REGEX = new RegExp(
    `^[${PROVINCE_ABBREVIATIONS.join('')}][A-Z][A-HJ-NP-Z0-9]{5}$`
)

// 新能源车牌正则：省份简称 + 字母 + 6位（小型新能源以D/F开头，大型以字母结尾）
const NEW_ENERGY_PLATE_REGEX = new RegExp(
    `^[${PROVINCE_ABBREVIATIONS.join('')}][A-Z][DF][A-HJ-NP-Z0-9]{5}$|^[${PROVINCE_ABBREVIATIONS.join('')}][A-Z][A-HJ-NP-Z0-9]{5}[DF]$`
)

/**
 * 校验 VIN（车架号）格式
 * @param vin 车架号
 * @returns 校验结果
 */
export function validateVin(vin: string): VinValidationResult {
    if (!vin) {
        return { isValid: false, errorMessage: 'VIN 不能为空' }
    }

    // 转换为大写
    const upperVin = vin.toUpperCase().trim()

    // 检查长度
    if (upperVin.length !== 17) {
        return {
            isValid: false,
            errorMessage: `VIN 必须为17位，当前为 ${upperVin.length} 位`
        }
    }

    // 检查是否包含非法字符 I, O, Q
    if (/[IOQ]/.test(upperVin)) {
        return {
            isValid: false,
            errorMessage: 'VIN 不能包含字母 I、O、Q'
        }
    }

    // 检查格式
    if (!VIN_REGEX.test(upperVin)) {
        return {
            isValid: false,
            errorMessage: 'VIN 只能包含数字和字母（不含 I、O、Q）'
        }
    }

    return { isValid: true }
}

/**
 * 校验车牌号格式
 * @param plateNumber 车牌号
 * @returns 校验结果
 */
export function validatePlateNumber(plateNumber: string): PlateValidationResult {
    if (!plateNumber) {
        return { isValid: false, errorMessage: '车牌号不能为空' }
    }

    // 去除空格和点号
    const cleanPlate = plateNumber.replace(/[\s·.]/g, '').toUpperCase()

    // 检查长度
    if (cleanPlate.length < 7 || cleanPlate.length > 8) {
        return {
            isValid: false,
            errorMessage: '车牌号长度不正确'
        }
    }

    // 检查省份简称
    const province = cleanPlate.charAt(0)
    if (!PROVINCE_ABBREVIATIONS.includes(province)) {
        return {
            isValid: false,
            errorMessage: '车牌号省份简称不正确'
        }
    }

    // 检查新能源车牌（8位）
    if (cleanPlate.length === 8) {
        if (NEW_ENERGY_PLATE_REGEX.test(cleanPlate)) {
            return { isValid: true, plateType: 'newEnergy' }
        }
        return {
            isValid: false,
            errorMessage: '新能源车牌格式不正确'
        }
    }

    // 检查普通车牌（7位）
    if (STANDARD_PLATE_REGEX.test(cleanPlate)) {
        return { isValid: true, plateType: 'standard' }
    }

    return {
        isValid: false,
        errorMessage: '车牌号格式不正确'
    }
}

/**
 * 格式化车牌号显示（添加分隔符）
 * @param plateNumber 车牌号
 * @returns 格式化后的车牌号
 */
export function formatPlateNumber(plateNumber: string): string {
    if (!plateNumber) return ''
    const clean = plateNumber.replace(/[\s·.]/g, '').toUpperCase()
    if (clean.length >= 2) {
        return `${clean.substring(0, 2)}·${clean.substring(2)}`
    }
    return clean
}

/**
 * 计算两点之间的距离（Haversine 公式）
 * @param lat1 点1纬度
 * @param lng1 点1经度
 * @param lat2 点2纬度
 * @param lng2 点2经度
 * @returns 距离（公里）
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371 // 地球半径（公里）
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180)
}

/**
 * 格式化车辆位置显示
 * @param cityName 城市名称
 * @param districtName 区县名称
 * @returns 格式化的位置字符串
 */
export function formatCarLocation(
    cityName?: string | null,
    districtName?: string | null
): string {
    if (cityName && districtName) {
        return `${cityName} · ${districtName}`
    }
    if (cityName) {
        return cityName
    }
    return ''
}

/**
 * 计算剩余天数
 * @param expiresAt 过期时间
 * @returns 剩余天数（负数表示已过期）
 */
export function calculateRemainingDays(expiresAt: Date | null): number | null {
    if (!expiresAt) return null

    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    return diffDays
}

/**
 * 获取30天后的日期
 * @param fromDate 起始日期，默认当前时间
 * @returns 30天后的日期
 */
export function getExpiryDate(fromDate?: Date): Date {
    const date = fromDate ? new Date(fromDate) : new Date()
    date.setDate(date.getDate() + 30)
    return date
}
