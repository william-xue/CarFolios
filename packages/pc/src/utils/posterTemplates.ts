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
    // 新增字段用于填充空白区域
    highlights?: string[]  // 车辆亮点，如：原版原漆、无事故、一手车
    transmission?: string  // 变速箱类型
    fuelType?: string      // 燃料类型
    displacement?: string  // 排量
}

export interface PosterTemplate {
    id: string
    name: string
    category: 'light' | 'dark' | 'colorful'  // 模板分类
    width: number
    height: number
    backgroundColor: string
    textColor: string
    secondaryColor: string
    accentColor: string
    gradientStart?: string
    gradientEnd?: string
    highlightBgColor?: string  // 亮点标签背景色
    highlightTextColor?: string // 亮点标签文字色
}

export interface RenderOptions {
    template: PosterTemplate
    car: CarInfo
    baseUrl?: string
    platformName?: string
    platformSlogan?: string
}

// 预定义模板 - 多风格设计
export const templates: PosterTemplate[] = [
    // 浅色系
    {
        id: 'elegant',
        name: '优雅白',
        category: 'light',
        width: 750,
        height: 1334,
        backgroundColor: '#fafafa',
        textColor: '#1a1a1a',
        secondaryColor: '#666666',
        accentColor: '#c9a050',
        gradientStart: '#ffffff',
        gradientEnd: '#f5f5f5',
        highlightBgColor: 'rgba(201, 160, 80, 0.15)',
        highlightTextColor: '#c9a050'
    },
    {
        id: 'minimal',
        name: '简约灰',
        category: 'light',
        width: 750,
        height: 1334,
        backgroundColor: '#f0f0f0',
        textColor: '#2d2d2d',
        secondaryColor: '#757575',
        accentColor: '#424242',
        gradientStart: '#fafafa',
        gradientEnd: '#e8e8e8',
        highlightBgColor: 'rgba(66, 66, 66, 0.1)',
        highlightTextColor: '#424242'
    },
    // 深色系
    {
        id: 'luxury',
        name: '奢华黑',
        category: 'dark',
        width: 750,
        height: 1334,
        backgroundColor: '#0d0d0d',
        textColor: '#ffffff',
        secondaryColor: '#999999',
        accentColor: '#d4af37',
        gradientStart: '#1a1a1a',
        gradientEnd: '#0d0d0d',
        highlightBgColor: 'rgba(212, 175, 55, 0.2)',
        highlightTextColor: '#d4af37'
    },
    {
        id: 'midnight',
        name: '午夜蓝',
        category: 'dark',
        width: 750,
        height: 1334,
        backgroundColor: '#0a1628',
        textColor: '#ffffff',
        secondaryColor: '#8fa3bf',
        accentColor: '#4a9eff',
        gradientStart: '#0f2744',
        gradientEnd: '#0a1628',
        highlightBgColor: 'rgba(74, 158, 255, 0.2)',
        highlightTextColor: '#4a9eff'
    },
    // 彩色系
    {
        id: 'business',
        name: '商务蓝',
        category: 'colorful',
        width: 750,
        height: 1334,
        backgroundColor: '#1e3a5f',
        textColor: '#ffffff',
        secondaryColor: '#b8c9dc',
        accentColor: '#00b4d8',
        gradientStart: '#264a73',
        gradientEnd: '#1e3a5f',
        highlightBgColor: 'rgba(0, 180, 216, 0.2)',
        highlightTextColor: '#00b4d8'
    },
    {
        id: 'vitality',
        name: '活力橙',
        category: 'colorful',
        width: 750,
        height: 1334,
        backgroundColor: '#fff8f0',
        textColor: '#2d2d2d',
        secondaryColor: '#666666',
        accentColor: '#ff6b35',
        gradientStart: '#ffffff',
        gradientEnd: '#fff0e6',
        highlightBgColor: 'rgba(255, 107, 53, 0.15)',
        highlightTextColor: '#ff6b35'
    },
    {
        id: 'tech',
        name: '科技紫',
        category: 'colorful',
        width: 750,
        height: 1334,
        backgroundColor: '#1a1033',
        textColor: '#ffffff',
        secondaryColor: '#a8a3b8',
        accentColor: '#a855f7',
        gradientStart: '#2d1f4e',
        gradientEnd: '#1a1033',
        highlightBgColor: 'rgba(168, 85, 247, 0.2)',
        highlightTextColor: '#a855f7'
    },
    {
        id: 'nature',
        name: '清新绿',
        category: 'colorful',
        width: 750,
        height: 1334,
        backgroundColor: '#f0fdf4',
        textColor: '#1a3d2e',
        secondaryColor: '#4a7c59',
        accentColor: '#22c55e',
        gradientStart: '#f7fef9',
        gradientEnd: '#e8f8ed',
        highlightBgColor: 'rgba(34, 197, 94, 0.15)',
        highlightTextColor: '#16a34a'
    }
]

// 按分类获取模板
export const templateCategories = [
    { id: 'light', name: '浅色系', templates: templates.filter(t => t.category === 'light') },
    { id: 'dark', name: '深色系', templates: templates.filter(t => t.category === 'dark') },
    { id: 'colorful', name: '彩色系', templates: templates.filter(t => t.category === 'colorful') }
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

    const isDark = template.category === 'dark' || template.id === 'tech' || template.id === 'business'
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

    tags.forEach((tag) => {
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

    // 9. 车辆亮点区域（填充空白）
    const highlightsY = bottomY + 180
    const defaultHighlights = ['品质认证', '专业检测', '全球配送', '售后保障']
    const highlights = car.highlights?.length ? car.highlights : defaultHighlights

    // 亮点区域标题
    ctx.fillStyle = template.textColor
    ctx.font = 'bold 24px "PingFang SC", sans-serif'
    ctx.fillText('✨ 服务保障', padding, highlightsY)

    // 绘制亮点标签网格
    const highlightStartY = highlightsY + 30
    const highlightTagHeight = 36
    const highlightGap = 12
    const maxTagsPerRow = 2
    let currentHighlightX = padding
    let currentHighlightY = highlightStartY
    let tagsInCurrentRow = 0

    ctx.font = '22px "PingFang SC", sans-serif'

    highlights.slice(0, 6).forEach((highlight) => {
        const tagWidth = ctx.measureText(highlight).width + 32

        // 检查是否需要换行
        if (tagsInCurrentRow >= maxTagsPerRow || currentHighlightX + tagWidth > template.width - padding) {
            currentHighlightX = padding
            currentHighlightY += highlightTagHeight + highlightGap
            tagsInCurrentRow = 0
        }

        // 绘制标签背景
        ctx.fillStyle = template.highlightBgColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
        drawRoundedRect(ctx, currentHighlightX, currentHighlightY, tagWidth, highlightTagHeight, 18)
        ctx.fill()

        // 绘制标签边框
        ctx.strokeStyle = template.highlightTextColor || template.accentColor
        ctx.lineWidth = 1
        drawRoundedRect(ctx, currentHighlightX, currentHighlightY, tagWidth, highlightTagHeight, 18)
        ctx.stroke()

        // 绘制标签文字
        ctx.fillStyle = template.highlightTextColor || template.accentColor
        ctx.fillText(highlight, currentHighlightX + 16, currentHighlightY + 25)

        currentHighlightX += tagWidth + highlightGap
        tagsInCurrentRow++
    })

    // 10. 营销文案区域
    const promoY = currentHighlightY + highlightTagHeight + 40

    // 营销文案背景卡片
    const promoCardWidth = template.width - padding * 2
    const promoCardHeight = 90

    // 绘制营销卡片背景渐变
    const promoGradient = ctx.createLinearGradient(padding, promoY, padding + promoCardWidth, promoY)
    promoGradient.addColorStop(0, template.accentColor)
    promoGradient.addColorStop(1, isDark ?
        (template.id === 'midnight' ? '#2563eb' : template.id === 'tech' ? '#7c3aed' : '#b8860b') :
        (template.id === 'vitality' ? '#f97316' : template.id === 'nature' ? '#16a34a' : '#d4a574'))

    ctx.fillStyle = promoGradient
    drawRoundedRect(ctx, padding, promoY, promoCardWidth, promoCardHeight, 16)
    ctx.fill()

    // 营销主标题
    ctx.fillStyle = isDark ? '#0d0d0d' : '#ffffff'
    ctx.font = 'bold 26px "PingFang SC", sans-serif'
    ctx.fillText('🔥 限时特惠', padding + 20, promoY + 35)

    // 营销副标题
    ctx.font = '18px "PingFang SC", sans-serif'
    ctx.fillStyle = isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)'
    ctx.fillText('首单立减 ¥500 · 推荐好友再享返现', padding + 20, promoY + 65)

    // 右侧装饰图标
    ctx.font = '32px sans-serif'
    ctx.fillText('🎁', template.width - padding - 55, promoY + 52)

    // 11. 联系方式区域
    const contactY = promoY + promoCardHeight + 25

    // 联系方式背景
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
    drawRoundedRect(ctx, padding, contactY, promoCardWidth, 50, 12)
    ctx.fill()

    // 联系人信息
    ctx.fillStyle = template.secondaryColor
    ctx.font = '20px "PingFang SC", sans-serif'
    ctx.fillText('👤 联系人: 包光辉', padding + 16, contactY + 32)

    // 联系电话
    ctx.fillStyle = template.accentColor
    ctx.font = 'bold 20px "PingFang SC", sans-serif'
    const phoneText = '📞 13917594507'
    const phoneWidth = ctx.measureText(phoneText).width
    ctx.fillText(phoneText, template.width - padding - phoneWidth - 16, contactY + 32)

    // 12. 底部装饰
    const footerY = template.height - 30
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'
    ctx.font = '16px "SF Pro Display", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`© ${new Date().getFullYear()} ${platformName}`, template.width / 2, footerY)
    ctx.textAlign = 'left'

    return canvas.toDataURL('image/png', 0.92)
}
