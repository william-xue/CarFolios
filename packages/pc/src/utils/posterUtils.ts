/**
 * 海报生成工具函数
 */

/**
 * 格式化价格用于海报显示
 * @param price 价格（万元）
 * @returns 格式化后的价格字符串，如 "¥21.00万"
 */
export function formatPriceForPoster(price: number): string {
    if (typeof price !== 'number' || isNaN(price)) {
        return '¥0.00万'
    }
    return `¥${price.toFixed(2)}万`
}

/**
 * 格式化里程用于海报显示
 * @param mileage 里程（万公里）
 * @returns 格式化后的里程字符串，如 "8.0万公里"
 */
export function formatMileageForPoster(mileage: number): string {
    if (typeof mileage !== 'number' || isNaN(mileage)) {
        return '0.0万公里'
    }
    return `${mileage.toFixed(1)}万公里`
}

/**
 * 生成海报下载文件名
 * @param carTitle 车辆标题
 * @returns 安全的文件名，如 "宝马3系_海报.png"
 */
export function generatePosterFilename(carTitle: string): string {
    if (!carTitle || typeof carTitle !== 'string') {
        return '车辆海报.png'
    }
    // 移除文件名中的非法字符
    const sanitized = carTitle
        .replace(/[\\/:*?"<>|]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 50) // 限制长度
    return `${sanitized || '车辆'}_海报.png`
}

/**
 * 生成车辆详情页 URL（用于二维码）
 * @param carId 车辆 ID
 * @param baseUrl 基础 URL
 * @returns 完整的车辆详情页 URL
 */
export function generateCarDetailUrl(carId: number, baseUrl: string): string {
    const base = baseUrl || window.location.origin
    return `${base}/car/${carId}`
}

/**
 * 加载图片，支持跨域和降级处理
 * @param src 图片 URL
 * @returns Promise<HTMLImageElement>
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'

        img.onload = () => resolve(img)

        img.onerror = () => {
            // 加载失败时返回占位图
            const placeholder = new Image()
            placeholder.src = createPlaceholderDataUrl()
            placeholder.onload = () => resolve(placeholder)
            placeholder.onerror = () => resolve(placeholder) // 即使占位图也失败，也返回
        }

        img.src = src
    })
}

/**
 * 创建占位图的 Data URL
 */
function createPlaceholderDataUrl(): string {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 300
    const ctx = canvas.getContext('2d')
    if (ctx) {
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, 400, 300)
        ctx.fillStyle = '#999'
        ctx.font = '24px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('图片加载失败', 200, 150)
    }
    return canvas.toDataURL('image/png')
}
