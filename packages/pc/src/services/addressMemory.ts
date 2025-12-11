/**
 * 地址记忆服务
 * 用于保存和获取用户历史输入的地址
 */

const STORAGE_KEY = 'user_address_history'
const MAX_HISTORY = 10

export interface AddressMemoryService {
    /** 获取历史地址列表 */
    getHistory(): string[]
    /** 保存新地址 */
    saveAddress(address: string): void
    /** 清空历史 */
    clearHistory(): void
}

/**
 * 创建地址记忆服务实例
 */
export function createAddressMemoryService(): AddressMemoryService {
    return {
        getHistory(): string[] {
            try {
                const data = localStorage.getItem(STORAGE_KEY)
                return data ? JSON.parse(data) : []
            } catch {
                return []
            }
        },

        saveAddress(address: string): void {
            if (!address || !address.trim()) return

            try {
                const history = this.getHistory()
                const trimmedAddress = address.trim()

                // 去重：移除已存在的相同地址
                const filtered = history.filter(a => a !== trimmedAddress)

                // 添加到最前面，并限制数量
                const updated = [trimmedAddress, ...filtered].slice(0, MAX_HISTORY)

                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
            } catch (error) {
                console.error('保存地址失败:', error)
            }
        },

        clearHistory(): void {
            try {
                localStorage.removeItem(STORAGE_KEY)
            } catch (error) {
                console.error('清空地址历史失败:', error)
            }
        }
    }
}

// 导出单例实例
export const addressMemoryService = createAddressMemoryService()

export default addressMemoryService
