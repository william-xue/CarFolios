import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    /**
     * 获取支付统计数据
     */
    async getPaymentStats() {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(today)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        // 并行查询支付统计
        const [
            todayStats,
            weekStats,
            monthStats,
            wechatStats,
            alipayStats,
            totalStats,
        ] = await Promise.all([
            // 今日支付统计
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
                where: {
                    status: 'paid',
                    paidAt: { gte: today },
                },
            }),
            // 本周支付统计
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
                where: {
                    status: 'paid',
                    paidAt: { gte: weekStart },
                },
            }),
            // 本月支付统计
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
                where: {
                    status: 'paid',
                    paidAt: { gte: monthStart },
                },
            }),
            // 微信支付统计
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
                where: {
                    status: 'paid',
                    channel: 'wechat',
                },
            }),
            // 支付宝统计
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
                where: {
                    status: 'paid',
                    channel: 'alipay',
                },
            }),
            // 总支付统计
            this.prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
                where: { status: 'paid' },
            }),
        ])

        return {
            today: {
                amount: todayStats._sum.amount || 0,
                count: todayStats._count,
            },
            week: {
                amount: weekStats._sum.amount || 0,
                count: weekStats._count,
            },
            month: {
                amount: monthStats._sum.amount || 0,
                count: monthStats._count,
            },
            byChannel: {
                wechat: {
                    amount: wechatStats._sum.amount || 0,
                    count: wechatStats._count,
                },
                alipay: {
                    amount: alipayStats._sum.amount || 0,
                    count: alipayStats._count,
                },
            },
            total: {
                amount: totalStats._sum.amount || 0,
                count: totalStats._count,
            },
        }
    }

    async getDashboardStats() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // 并行查询所有统计数据
        const [
            totalCars,
            onlineCars,
            pendingCars,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalUsers,
            todayNewCars,
            todayNewOrders,
            todayNewUsers,
            revenueResult,
        ] = await Promise.all([
            // 车源统计
            this.prisma.car.count(),
            this.prisma.car.count({ where: { status: 'on' } }),
            this.prisma.car.count({ where: { status: 'pending' } }),
            // 订单统计
            this.prisma.order.count(),
            this.prisma.order.count({ where: { status: 'pending' } }),
            this.prisma.order.count({ where: { status: 'closed' } }),
            // 用户统计
            this.prisma.user.count(),
            // 今日新增
            this.prisma.car.count({ where: { createdAt: { gte: today } } }),
            this.prisma.order.count({ where: { createdAt: { gte: today } } }),
            this.prisma.user.count({ where: { createdAt: { gte: today } } }),
            // 总收入（已支付订单的定金总和）
            this.prisma.order.aggregate({
                _sum: { depositAmount: true },
                where: { status: { in: ['paid', 'closed'] } },
            }),
        ])

        return {
            totalCars,
            onlineCars,
            pendingCars,
            totalOrders,
            pendingOrders,
            completedOrders,
            totalUsers,
            todayNewCars,
            todayNewOrders,
            todayNewUsers,
            totalRevenue: revenueResult._sum.depositAmount || 0,
        }
    }
}
