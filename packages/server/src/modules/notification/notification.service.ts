import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PaginatedResult } from '../../common/dto/pagination.dto'

// 过期提醒通知数据
export interface ExpiryNotification {
    userId: number
    carId: number
    carTitle: string
    daysUntilExpiry: number
    notificationType: 'first' | 'second' | 'final' | 'expired'
}

@Injectable()
export class NotificationService {
    constructor(private prisma: PrismaService) { }

    // 发送过期提醒
    async sendExpiryReminder(
        userId: number,
        carId: number,
        carTitle: string,
        daysUntilExpiry: number,
    ) {
        let title: string
        let content: string

        if (daysUntilExpiry === 7) {
            title = '车辆即将过期提醒'
            content = `您发布的车辆「${carTitle}」将在7天后过期，请及时续期以保持展示。`
        } else if (daysUntilExpiry === 3) {
            title = '车辆过期提醒'
            content = `您发布的车辆「${carTitle}」将在3天后过期，请尽快续期。`
        } else if (daysUntilExpiry === 1) {
            title = '车辆即将过期'
            content = `您发布的车辆「${carTitle}」将在明天过期，请立即续期以避免下架。`
        } else if (daysUntilExpiry <= 0) {
            title = '车辆已过期'
            content = `您发布的车辆「${carTitle}」已过期下架，如需继续展示请重新上架。`
        } else {
            title = '车辆过期提醒'
            content = `您发布的车辆「${carTitle}」将在${daysUntilExpiry}天后过期。`
        }

        return this.prisma.notification.create({
            data: {
                userId,
                type: 'expiry_reminder',
                title,
                content,
                data: JSON.stringify({ carId, daysUntilExpiry }),
            },
        })
    }

    // 批量发送过期提醒
    async sendBatchExpiryReminders(notifications: ExpiryNotification[]) {
        const results: Awaited<ReturnType<typeof this.sendExpiryReminder>>[] = []
        for (const notification of notifications) {
            const result = await this.sendExpiryReminder(
                notification.userId,
                notification.carId,
                notification.carTitle,
                notification.daysUntilExpiry,
            )
            results.push(result)
        }
        return results
    }

    // 获取用户通知列表
    async getUserNotifications(userId: number, page = 1, pageSize = 10) {
        const [list, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.notification.count({ where: { userId } }),
        ])

        // 解析 JSON data 字段
        const parsedList = list.map((notification) => ({
            ...notification,
            data: notification.data ? JSON.parse(notification.data) : null,
        }))

        return new PaginatedResult(parsedList, total, page, pageSize)
    }

    // 获取未读通知数量
    async getUnreadCount(userId: number) {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        })
    }

    // 标记通知已读
    async markAsRead(notificationId: number, userId: number) {
        return this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        })
    }

    // 标记所有通知已读
    async markAllAsRead(userId: number) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        })
    }

    // 发送系统通知
    async sendSystemNotification(userId: number, title: string, content: string, data?: any) {
        return this.prisma.notification.create({
            data: {
                userId,
                type: 'system',
                title,
                content,
                data: data ? JSON.stringify(data) : null,
            },
        })
    }

    // 删除通知
    async deleteNotification(notificationId: number, userId: number) {
        return this.prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        })
    }
}
