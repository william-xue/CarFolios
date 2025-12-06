import { SUPPORTED_LOCALES, type SupportedLocale } from '@/locales'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export function useLocale() {
    const { locale, t, n, d } = useI18n()

    const currentLocale = computed(() => locale.value as SupportedLocale)
    const currentLocaleName = computed(
        () => SUPPORTED_LOCALES.find((l) => l.code === locale.value)?.name || ''
    )

    function setLocale(code: SupportedLocale) {
        locale.value = code
        try {
            localStorage.setItem('locale', code)
        } catch {
            // localStorage 不可用
        }
        document.documentElement.lang = code
    }

    // 本地化格式化函数（添加空值保护）
    function formatPrice(value: number | null | undefined): string {
        if (value == null || isNaN(value)) return '-'
        return n(value, 'currency')
    }

    function formatDate(value: Date | string | null | undefined): string {
        if (!value) return '-'
        try {
            return d(new Date(value), 'short')
        } catch {
            return '-'
        }
    }

    function formatMileage(value: number | null | undefined): string {
        if (value == null || isNaN(value)) return '-'
        const unit = t('common.mileageUnit')
        return `${n(value)}${unit}`
    }

    return {
        locale: currentLocale,
        localeName: currentLocaleName,
        locales: SUPPORTED_LOCALES,
        setLocale,
        t,
        n,
        d,
        formatPrice,
        formatDate,
        formatMileage,
    }
}
