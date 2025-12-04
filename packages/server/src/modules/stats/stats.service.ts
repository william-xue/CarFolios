import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

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
