/**
 * 海报模板配置和渲染 - 高级版
 */
import QRCode from 'qrcode'
import {
    formatPriceForPoster,
    formatMileageForPoster,
    loadImage,
    generateCarDetailUrl
} from './posterUtils'

export interface CarInfo {
    id: number
    title: string
    price: number
    mileage: number
    firstRegDate: string
    coverImage: string
    cityName?: string
}

export interface PosterTemplate {
    id: string
    name: string
    width: number
    height: number
    backgroundColor: string
    textColor: string
    secondaryColor: string
    accentColor: string
    gradientStart?: string
    gradientEnd?: string
}

export interface RenderOptions {
    template: PosterTemplate
    car: CarInfo
    baseUrl?: string
    platformName?: string
    platformSlogan?: string
}

// 预定义模板 - 更精致的设计
export const templates: PosterTemplate[] = [
    {
        id: 'elegant',
        name: '优雅白',
        width: 750,
        height: 1334,
        backgroundColor: '#fafafa',
        textColor: '#1a1a1a',
        secondaryColor: '#666666',
        accentColor: '#c9a050',
        gradientStart: '#ffffff',
        gradientEnd: '#f5f5f5'
    },
    {
        id: 'luxury',
        name: '奢华黑',
        width: 750,
        height: 1334,
        backgroundColor: '#0d0d0d',
        textColor: '#ffffff',
        secondaryColor: '#999999',
        accentColor: '#d4af37',
        gradientStart: '#1a1a1a',
        gradientEnd: '#0d0d0d'
    }
]

/**
 * 绘制圆角矩形
 */
export function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    width: number, height: number,
    radius: number
): void {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
}

/**
 * 绘制文字（支持自动换行，返回最终 Y 坐标）
 */
export function drawText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number, y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 2
): number {
    const words = text.split('')
    let line = ''
    let currentY = y
    let lineCount = 0

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i]
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth && i > 0) {
            lineCount++
            if (lineCount >= maxLines) {
                ctx.fillText(line.slice(0, -1) + '...', x, currentY)
                return currentY
            }
            ctx.fillText(line, x, currentY)
            line = words[i]
            currentY += lineHeight
        } else {
            line = testLine
        }
    }
    ctx.fillText(line, x, currentY)
    return currentY
}

/**
 * 生成二维码 Data URL
 */
export async function generateQRCode(url: string, size: number, dark: string = '#000000'): Promise<string> {
    return QRCode.toDataURL(url, {
        width: size,
        margin: 0,
        color: { dark, light: '#ffffff00' },
        errorCorrectionLevel: 'M'
    })
}

/**
 * 主渲染函数 - 生成高级海报
 */
export async function renderPoster(options: RenderOptions): Promise<string> {
    const {
        template,
        car,
        baseUrl = window.location.origin,
        platformName = 'CarFolios',
        platformSlogan = '全球二手车出口平台'
    } = options

    const canvas = document.createElement('canvas')
    canvas.width = template.width
    canvas.height = template.height
    const ctx = canvas.getContext('2d')!

    const isDark = template.id === 'luxury'
    const padding = 48

    // 1. 绘制渐变背景
    const bgGradient = ctx.createLinearGradient(0, 0, 0, template.height)
    bgGradient.addColorStop(0, template.gradientStart || template.backgroundColor)
    bgGradient.addColorStop(1, template.gradientEnd || template.backgroundColor)
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, template.width, template.height)

    // 2. 顶部品牌区域
    const brandY = 50
    ctx.fillStyle = template.accentColor
    ctx.font = 'bold 32px "SF Pro Display", "PingFang SC", sans-serif'
    ctx.fillText(platformName, padding, brandY)

    // 品牌装饰线
    const brandWidth = ctx.measureText(platformName).width
    ctx.strokeStyle = template.accentColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding + brandWidth + 16, brandY - 8)
    ctx.lineTo(template.width - padding, brandY - 8)
    ctx.stroke()

    // 3. 车辆图片区域 - 带阴影效果
    const imgY = brandY + 40
    const imgWidth = template.width - padding * 2
    const imgHeight = 420

    // 图片阴影
    if (!isDark) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
        ctx.shadowBlur = 30
        ctx.shadowOffsetY = 10
    }

    // 绘制图片容器背景
    ctx.fillStyle = isDark ? '#1a1a1a' : '#ffffff'
    drawRoundedRect(ctx, padding, imgY, imgWidth, imgHeight, 20)
    ctx.fill()
    ctx.shadowColor = 'transparent'

    // 加载并绘制车辆图片
    const coverImg = await loadImage(car.coverImage)
    ctx.save()
    drawRoundedRect(ctx, padding, imgY, imgWidth, imgHeight, 20)
    ctx.clip()

    const imgRatio = coverImg.width / coverImg.height
    const containerRatio = imgWidth / imgHeight
    let drawWidth, drawHeight, drawX, drawY

    if (imgRatio > containerRatio) {
        drawHeight = imgHeight
        drawWidth = imgHeight * imgRatio
        drawX = padding - (drawWidth - imgWidth) / 2
        drawY = imgY
    } else {
        drawWidth = imgWidth
        drawHeight = drawWidth / imgRatio
        drawX = padding
        drawY = imgY - (drawHeight - imgHeight) / 2
    }
    ctx.drawImage(coverImg, drawX, drawY, drawWidth, drawHeight)
    ctx.restore()

    // 4. 价格标签 - 悬浮在图片上
    const priceTagY = imgY + imgHeight - 70
    const priceText = formatPriceForPoster(car.price)
    ctx.font = 'bold 48px "SF Pro Display", "DIN Alternate", sans-serif'
    const priceWidth = ctx.measureText(priceText).width + 40

    // 价格标签背景
    const priceGradient = ctx.createLinearGradient(padding + 20, 0, padding + 20 + priceWidth, 0)
    priceGradient.addColorStop(0, template.accentColor)
    priceGradient.addColorStop(1, isDark ? '#b8860b' : '#e6c069')
    ctx.fillStyle = priceGradient
    drawRoundedRect(ctx, padding + 20, priceTagY, priceWidth, 56, 28)
    ctx.fill()

    // 价格文字
    ctx.fillStyle = isDark ? '#0d0d0d' : '#ffffff'
    ctx.fillText(priceText, padding + 40, priceTagY + 40)

    // 5. 车辆信息区域
    const infoY = imgY + imgHeight + 36

    // 车辆标题
    ctx.fillStyle = template.textColor
    ctx.font = 'bold 38px "PingFang SC", "Microsoft YaHei", sans-serif'
    drawText(ctx, car.title, padding, infoY, template.width - padding * 2, 48, 2)

    // 6. 车辆参数标签
    const tagsY = infoY + 70
    const tags = [
        { icon: '📅', text: car.firstRegDate || '-' },
        { icon: '🛣️', text: formatMileageForPoster(car.mileage) },
        { icon: '📍', text: car.cityName || '-' }
    ]

    let tagX = padding
    ctx.font = '26px "PingFang SC", sans-serif'

    tags.forEach((tag, index) => {
        // 标签背景
        const tagText = `${tag.icon} ${tag.text}`
        const tagWidth = ctx.measureText(tagText).width + 24

        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'
        drawRoundedRect(ctx, tagX, tagsY - 28, tagWidth, 40, 20)
        ctx.fill()

        // 标签文字
        ctx.fillStyle = template.secondaryColor
        ctx.fillText(tagText, tagX + 12, tagsY)

        tagX += tagWidth + 12
    })

    // 7. 分隔线
    const dividerY = tagsY + 50
    const dividerGradient = ctx.createLinearGradient(padding, 0, template.width - padding, 0)
    dividerGradient.addColorStop(0, 'transparent')
    dividerGradient.addColorStop(0.2, isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
    dividerGradient.addColorStop(0.8, isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)')
    dividerGradient.addColorStop(1, 'transparent')
    ctx.strokeStyle = dividerGradient
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, dividerY)
    ctx.lineTo(template.width - padding, dividerY)
    ctx.stroke()

    // 8. 底部区域 - 二维码 + 引导文案
    const bottomY = dividerY + 30

    // 生成二维码
    const qrUrl = generateCarDetailUrl(car.id, baseUrl)
    const qrDataUrl = await generateQRCode(qrUrl, 200, template.textColor)
    const qrImg = await loadImage(qrDataUrl)

    // 二维码容器
    const qrSize = 140
    const qrContainerSize = qrSize + 20
    const qrX = template.width - padding - qrContainerSize

    // 二维码背景
    ctx.fillStyle = '#ffffff'
    drawRoundedRect(ctx, qrX, bottomY, qrContainerSize, qrContainerSize, 12)
    ctx.fill()

    // 绘制二维码
    ctx.drawImage(qrImg, qrX + 10, bottomY + 10, qrSize, qrSize)

    // 左侧引导文案
    ctx.fillStyle = template.textColor
    ctx.font = 'bold 28px "PingFang SC", sans-serif'
    ctx.fillText('扫码查看详情', padding, bottomY + 40)

    ctx.fillStyle = template.secondaryColor
    ctx.font = '22px "PingFang SC", sans-serif'
    ctx.fillText('更多车源 · 专业服务 · 全球配送', padding, bottomY + 80)

    // 平台标语
    ctx.fillStyle = template.accentColor
    ctx.font = '20px "PingFang SC", sans-serif'
    ctx.fillText(platformSlogan, padding, bottomY + 120)

    // 9. 底部装饰
    const footerY = template.height - 40
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
    ctx.font = '18px "SF Pro Display", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`© ${new Date().getFullYear()} ${platformName}`, template.width / 2, footerY)
    ctx.textAlign = 'left'

    return canvas.toDataURL('image/png', 0.92)
}
