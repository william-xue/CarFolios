const PREFIX = 'car_mobile_'

export const storage = {
    get<T>(key: string): T | null {
        const data = localStorage.getItem(PREFIX + key)
        if (!data) return null
        try {
            return JSON.parse(data) as T
        } catch {
            return null
        }
    },
    set(key: string, value: unknown): void {
        localStorage.setItem(PREFIX + key, JSON.stringify(value))
    },
    remove(key: string): void {
        localStorage.removeItem(PREFIX + key)
    },
}
