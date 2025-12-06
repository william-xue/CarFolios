import { get, post } from './request'
import type { PageResult } from '@/types'

export interface Notification {
    id: number
    userId: number
    type: string
    title: string
    content: string
    data: any
    isRead: boolean
    createdAt: string
}

// 获取通知列表
export function getNotifications(params: { page?: number; pageSize?: number }): Promise<PageResult<Notification>> {
    return get('/notifications', { params })
}

// 获取未读通知数量
export function getUnreadCount(): Promise<{ count: number }> {
    return get('/notifications/unread-count')
}

// 标记通知已读
export function markAsRead(id: number): Promise<{ success: boolean }> {
    return post(`/notifications/${id}/read`)
}

// 标记所有通知已读
export function markAllAsRead(): Promise<{ success: boolean }> {
    return post('/notifications/read-all')
}
