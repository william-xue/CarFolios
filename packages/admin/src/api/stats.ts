import request from './request'
import type { DashboardStats } from '@/types'

// 获取仪表盘统计数据
export function getDashboardStats(): Promise<DashboardStats> {
    return request.get('/stats/dashboard')
}
