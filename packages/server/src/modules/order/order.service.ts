import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PaginatedResult } from '../../common/dto/pagination.dto'

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) { }

    // 生成订单号
    private generateOrderNo() {
        const date = new Date()
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
        const random = Math.random().toString(36).slice(-6).toUpperCase()
        return `ORD${dateStr}${random}`
    }

    // 创建订单
    async create(buyerId: number, carId: number, depositAmount: number) {
        const car = await this.prisma.car.findUnique({
            where: { id: carId },
            include: { owner: true },
        })

        if (!car) throw new NotFoundException('车源不存在')
        if (car.status !== 'on') throw new BadRequestException('车源已下架')
        if (car.ownerId === buyerId) throw new BadRequestException('不能购买自己的车源')

        return this.prisma.order.create({
            data: {
                orderNo: this.generateOrderNo(),
                carId,
                buyerId,
                sellerId: car.ownerId,
                carTitle: car.title,
                carImage: car.coverImage,
                carPrice: car.price,
                depositAmount,
            },
        })
    }

    // 获取订单列表
    async findAll(query: { page?: number; pageSize?: number; status?: string; keyword?: string }) {
        const page = Number(query.page) || 1
        const pageSize = Number(query.pageSize) || 10
        const { status, keyword } = query

        const where: any = {}
        if (status) {
            where.status = status
        }
        if (keyword) {
            where.OR = [{ orderNo: { contains: keyword } }, { carTitle: { contains: keyword } }]
        }

        const [list, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    buyer: { select: { id: true, nickname: true, mobile: true } },
                    seller: { select: { id: true, nickname: true, mobile: true } },
                },
            }),
            this.prisma.order.count({ where }),
        ])

        return new PaginatedResult(list, total, page, pageSize)
    }

    // 获取用户订单
    async findByUser(userId: number, type: 'buy' | 'sell', query: { page?: number; pageSize?: number; status?: string }) {
        const page = Number(query.page) || 1
        const pageSize = Number(query.pageSize) || 10
        const { status } = query

        const where: any = type === 'buy' ? { buyerId: userId } : { sellerId: userId }
        if (status) {
            where.status = status
        }

        const [list, total] = await Promise.all([
            this.prisma.order.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.order.count({ where }),
        ])

        return new PaginatedResult(list, total, page, pageSize)
    }

    // 获取订单详情
    async findOne(id: number) {
        const order = await this.prisma.order.findUnique({
            where: { id },
            include: {
                car: true,
                buyer: { select: { id: true, nickname: true, mobile: true, avatar: true } },
                seller: { select: { id: true, nickname: true, mobile: true, avatar: true } },
            },
        })

        if (!order) throw new NotFoundException('订单不存在')
        return order
    }

    // 支付订单
    async pay(id: number, userId: number) {
        const order = await this.prisma.order.findUnique({ where: { id } })
        if (!order) throw new NotFoundException('订单不存在')
        if (order.buyerId !== userId) throw new BadRequestException('无权操作此订单')
        if (order.status !== 'pending') throw new BadRequestException('订单状态不正确')

        return this.prisma.order.update({
            where: { id },
            data: { status: 'paid', payTime: new Date() },
        })
    }

    // 完成订单
    async complete(id: number) {
        const order = await this.prisma.order.findUnique({ where: { id } })
        if (!order) throw new NotFoundException('订单不存在')
        if (order.status !== 'paid') throw new BadRequestException('订单状态不正确')

        // 同时将车源状态改为已售
        await this.prisma.car.update({
            where: { id: order.carId },
            data: { status: 'sold' },
        })

        return this.prisma.order.update({
            where: { id },
            data: { status: 'closed', closeTime: new Date() },
        })
    }

    // 取消订单
    async cancel(id: number, userId?: number) {
        const order = await this.prisma.order.findUnique({ where: { id } })
        if (!order) throw new NotFoundException('订单不存在')
        if (userId && order.buyerId !== userId) throw new BadRequestException('无权操作此订单')
        if (!['pending', 'paid'].includes(order.status)) throw new BadRequestException('订单状态不正确')

        return this.prisma.order.update({
            where: { id },
            data: { status: 'cancelled' },
        })
    }

    // 退款
    async refund(id: number) {
        const order = await this.prisma.order.findUnique({ where: { id } })
        if (!order) throw new NotFoundException('订单不存在')
        if (order.status !== 'paid') throw new BadRequestException('订单状态不正确')

        return this.prisma.order.update({
            where: { id },
            data: { status: 'refunded' },
        })
    }
}
