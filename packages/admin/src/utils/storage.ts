// localStorage 工具函数
const STORAGE_PREFIX = 'car_admin_'

export const storage = {
    get<T>(key: string, defaultValue?: T): T | null {
        const value = localStorage.getItem(STORAGE_PREFIX + key)
        if (value === null) return defaultValue ?? null
        try {
            return JSON.parse(value) as T
        } catch {
            return value as unknown as T
        }
    },

    set(key: string, value: unknown): void {
        localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
    },

    remove(key: string): void {
        localStorage.removeItem(STORAGE_PREFIX + key)
    },

    clear(): void {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
            if (key.startsWith(STORAGE_PREFIX)) {
                localStorage.removeItem(key)
            }
        })
    },
}

// Token 管理
export const TOKEN_KEY = 'token'

export function getToken(): string | null {
    return storage.get<string>(TOKEN_KEY)
}

export function setToken(token: string): void {
    storage.set(TOKEN_KEY, token)
}

export function removeToken(): void {
    storage.remove(TOKEN_KEY)
}
