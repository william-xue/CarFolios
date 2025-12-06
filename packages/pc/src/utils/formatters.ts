/**
 * 格式化日期
 */
export function formatDate(date: string | Date, format: 'date' | 'datetime' | 'relative' = 'date'): string {
    const d = typeof date === 'string' ? new Date(date) : date

    if (isNaN(d.getTime())) {
        return '-'
    }

    if (format === 'relative') {
        return formatRelativeTime(d)
    }

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    if (format === 'datetime') {
        const hours = String(d.getHours()).padStart(2, '0')
        const minutes = String(d.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}`
    }

    return `${year}-${month}-${day}`
}

/**
 * 格式化相对时间
 */
function formatRelativeTime(date: Date): string {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 30) {
        return formatDate(date, 'date')
    }
    if (days > 0) {
        return `${days}天前`
    }
    if (hours > 0) {
        return `${hours}小时前`
    }
    if (minutes > 0) {
        return `${minutes}分钟前`
    }
    return '刚刚'
}

/**
 * 格式化价格（万元）
 */
export function formatPrice(price: number): string {
    if (price === 0) {
        return '面议'
    }
    // 价格单位为分，转换为万元
    const wan = price / 10000
    if (wan >= 1) {
        return `${wan.toFixed(2)}万`
    }
    return `${price.toFixed(2)}元`
}

/**
 * 格式化里程
 */
export function formatMileage(mileage: number): string {
    if (mileage >= 10000) {
        return `${(mileage / 10000).toFixed(1)}万公里`
    }
    return `${mileage}公里`
}

/**
 * 格式化变速箱类型
 */
export function formatGearbox(gearbox: string): string {
    const gearboxMap: Record<string, string> = {
        manual: '手动',
        auto: '自动',
        cvt: 'CVT无级变速',
        dct: '双离合',
        amt: 'AMT',
    }
    return gearboxMap[gearbox] || gearbox
}

/**
 * 格式化燃料类型
 */
export function formatFuelType(fuelType: string): string {
    const fuelTypeMap: Record<string, string> = {
        gasoline: '汽油',
        diesel: '柴油',
        electric: '纯电动',
        hybrid: '油电混合',
        phev: '插电混动',
    }
    return fuelTypeMap[fuelType] || fuelType
}

/**
 * 格式化车源状态
 */
export function formatCarStatus(status: string): string {
    const statusMap: Record<string, string> = {
        pending: '待审核',
        on: '在售',
        off: '已下架',
        sold: '已售出',
        expired: '已过期',
    }
    return statusMap[status] || status
}

/**
 * 格式化订单状态
 */
export function formatOrderStatus(status: string): string {
    const statusMap: Record<string, string> = {
        pending: '待支付',
        paid: '已支付',
        completed: '已完成',
        cancelled: '已取消',
        refunded: '已退款',
    }
    return statusMap[status] || status
}

/**
 * 判断是否即将过期（7天内）
 */
export function isExpiringSoon(expireDate: string | Date): boolean {
    const expire = typeof expireDate === 'string' ? new Date(expireDate) : expireDate
    const now = new Date()
    const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7
}

/**
 * 判断是否已过期
 */
export function isExpired(expireDate: string | Date): boolean {
    const expire = typeof expireDate === 'string' ? new Date(expireDate) : expireDate
    return expire.getTime() < Date.now()
}

/**
 * 计算续期后的新过期日期（续期30天）
 */
export function calculateNewExpireDate(currentExpireDate: string | Date): Date {
    const current = typeof currentExpireDate === 'string' ? new Date(currentExpireDate) : currentExpireDate
    const now = new Date()

    // 如果已过期，从今天开始计算；否则从当前过期日期开始计算
    const baseDate = current.getTime() < now.getTime() ? now : current
    const newExpire = new Date(baseDate)
    newExpire.setDate(newExpire.getDate() + 30)

    return newExpire
}

/**
 * 获取剩余天数
 */
export function getRemainingDays(expireDate: string | Date): number {
    const expire = typeof expireDate === 'string' ? new Date(expireDate) : expireDate
    const now = new Date()
    const diffDays = Math.ceil((expire.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
}
