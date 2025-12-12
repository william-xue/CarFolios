import AsyncStorage from '@react-native-async-storage/async-storage'

// API 基础 URL - 可配置
const API_BASE_URL = __DEV__
    ? 'http://localhost:3000/api'
    : 'http://47.97.152.103:8000/api'

// 存储 key
const TOKEN_KEY = '@auth_token'

// 获取 token
async function getToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY)
    } catch {
        return null
    }
}

// 保存 token
export async function setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token)
}

// 清除 token
export async function clearToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY)
}

// 请求配置
interface RequestConfig {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    headers?: Record<string, string>
    body?: any
    timeout?: number
}

// 请求错误
export class ApiError extends Error {
    code: number
    constructor(code: number, message: string) {
        super(message)
        this.code = code
        this.name = 'ApiError'
    }
}

// 通用请求方法
async function request<T>(
    endpoint: string,
    config: RequestConfig = {}
): Promise<T> {
    const { method = 'GET', headers = {}, body, timeout = 30000 } = config

    const token = await getToken()

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    }

    if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
        const url = `${API_BASE_URL}${endpoint}`
        console.log(`[API Request] ${method} ${url}`, body || '')
        
        const response = await fetch(url, {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        })

        clearTimeout(timeoutId)

        const text = await response.text()
        console.log(`[API Response] ${method} ${url}`, response.status, text.substring(0, 500))
        
        let parsed: any
        try {
            parsed = JSON.parse(text)
        } catch {
            console.error('[API Parse Error]', text.substring(0, 200))
            throw new ApiError(-1, '响应解析失败')
        }

        // 兼容两种响应格式：
        // 1. { code: 0, data: ... } - 标准格式
        // 2. 直接返回数据（数组或对象）
        if (parsed && typeof parsed === 'object' && 'code' in parsed) {
            // 标准格式
            if (parsed.code !== 0 && parsed.code !== 200) {
                throw new ApiError(parsed.code, parsed.message || '请求失败')
            }
            return parsed.data
        } else {
            // 直接返回数据格式
            return parsed as T
        }
    } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof ApiError) {
            throw error
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new ApiError(-1, '请求超时')
            }
            throw new ApiError(-1, error.message || '网络错误')
        }

        throw new ApiError(-1, '未知错误')
    }
}

// GET 请求
export function get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint
    if (params) {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, String(value))
            }
        })
        const queryString = searchParams.toString()
        if (queryString) {
            url += `?${queryString}`
        }
    }
    return request<T>(url, { method: 'GET' })
}

// POST 请求
export function post<T>(endpoint: string, body?: any): Promise<T> {
    return request<T>(endpoint, { method: 'POST', body })
}

// PUT 请求
export function put<T>(endpoint: string, body?: any): Promise<T> {
    return request<T>(endpoint, { method: 'PUT', body })
}

// DELETE 请求
export function del<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, { method: 'DELETE' })
}

export default { get, post, put, del, setToken, clearToken }
