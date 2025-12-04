import axios from 'axios'
import { showToast } from 'vant'
import { storage } from '@/utils/storage'

const TOKEN_KEY = 'token'

const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
})

// 请求拦截器
request.interceptors.request.use(
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
request.interceptors.response.use(
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

export default request
