import axios, { type AxiosRequestConfig } from 'axios'
import { showToast } from 'vant'
import { storage } from '@/utils/storage'

const TOKEN_KEY = 'token'

const instance = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// 请求拦截器
instance.interceptors.request.use(
    (config) => {
        const token = storage.get<string>(TOKEN_KEY)
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// 响应拦截器
instance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        const message = error.response?.data?.message || '网络错误，请稍后重试'
        if (error.response?.status === 401) {
            storage.remove(TOKEN_KEY)
            window.location.href = '/login'
        } else {
            showToast(message)
        }
        return Promise.reject(error)
    }
)

// 封装请求方法，返回正确的类型
const request = {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return instance.get(url, config) as Promise<T>
    },
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return instance.post(url, data, config) as Promise<T>
    },
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return instance.put(url, data, config) as Promise<T>
    },
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
        return instance.patch(url, data, config) as Promise<T>
    },
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
        return instance.delete(url, config) as Promise<T>
    },
}

export default request
