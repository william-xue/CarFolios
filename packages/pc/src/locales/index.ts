import { createI18n } from 'vue-i18n'
import zhCN from './zh-CN.json'
import enUS from './en-US.json'
import jaJP from './ja-JP.json'
import koKR from './ko-KR.json'
import zhTW from './zh-TW.json'

export type SupportedLocale = 'zh-CN' | 'en-US' | 'ja-JP' | 'ko-KR' | 'zh-TW'

export const SUPPORTED_LOCALES: { code: SupportedLocale; name: string }[] = [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'zh-TW', name: '繁體中文' },
]

function getInitialLocale(): SupportedLocale {
    // 1. 从 localStorage 读取
    try {
        const saved = localStorage.getItem('locale') as SupportedLocale
        if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) return saved
    } catch {
        // localStorage 不可用
    }

    // 2. 检测浏览器语言
    const browserLang = navigator.language
    const matched = SUPPORTED_LOCALES.find(l => browserLang.startsWith(l.code.split('-')[0]))
    if (matched) return matched.code

    // 3. 默认简体中文
    return 'zh-CN'
}

export const i18n = createI18n({
    legacy: false,
    locale: getInitialLocale(),
    fallbackLocale: 'zh-CN',
    messages: {
        'zh-CN': zhCN,
        'en-US': enUS,
        'ja-JP': jaJP,
        'ko-KR': koKR,
        'zh-TW': zhTW,
    },
    numberFormats: {
        'zh-CN': {
            currency: { style: 'currency', currency: 'CNY' },
            decimal: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
        },
        'en-US': {
            currency: { style: 'currency', currency: 'USD' },
            decimal: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
        },
        'ja-JP': {
            currency: { style: 'currency', currency: 'JPY' },
            decimal: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
        },
        'ko-KR': {
            currency: { style: 'currency', currency: 'KRW' },
            decimal: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
        },
        'zh-TW': {
            currency: { style: 'currency', currency: 'TWD' },
            decimal: { style: 'decimal', minimumFractionDigits: 0, maximumFractionDigits: 2 },
        },
    },
    datetimeFormats: {
        'zh-CN': {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        },
        'en-US': {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        },
        'ja-JP': {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        },
        'ko-KR': {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        },
        'zh-TW': {
            short: { year: 'numeric', month: '2-digit', day: '2-digit' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        },
    },
})

export default i18n
