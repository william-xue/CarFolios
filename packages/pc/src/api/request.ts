import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

const TOKEN_KEY = 'carfolios_token'

// 创建 axios 实例
const request: AxiosInstance = axios.create({
    baseURL: '/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(TOKEN_KEY)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse) => {
        return response.data
    },
    (error) => {
        if (!error.response) {
            ElMessage.error('网络连接失败，请检查网络设置')
            return Promise.reject(error)
        }

        const { status, data } = error.response

        switch (status) {
            case 401:
                // 未授权，清除 token
                localStorage.removeItem(TOKEN_KEY)
                localStorage.removeItem('carfolios_user')
                ElMessage.error('登录已过期，请重新登录')
                // 可以在这里触发跳转到登录页
                window.location.href = '/login'
                break
            case 403:
                ElMessage.error('您没有权限执行此操作')
                break
            case 404:
                ElMessage.error('请求的资源不存在')
                break
            case 422:
                // 验证错误
                if (data?.details) {
                    Object.values(data.details).forEach((msg) => {
                        ElMessage.error(msg as string)
                    })
                } else {
                    ElMessage.error(data?.message || '数据验证失败')
                }
                break
            case 500:
                ElMessage.error('服务器错误，请稍后重试')
                break
            default:
                ElMessage.error(data?.message || '请求失败')
        }

        return Promise.reject(error)
    }
)

// 封装请求方法
export function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.get(url, config)
}

export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request.post(url, data, config)
}

export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request.put(url, data, config)
}

export function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request.delete(url, config)
}

export function patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request.patch(url, data, config)
}

export default request
