import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PaginatedResult } from '../../common/dto/pagination.dto'

@Injectable()
export class FavoriteService {
    constructor(private prisma: PrismaService) { }

    // 添加收藏
    async addFavorite(userId: number, carId: number) {
        // 检查车辆是否存在
        const car = await this.prisma.car.findUnique({ where: { id: carId } })
        if (!car) throw new NotFoundException('车辆不存在')

        // 检查是否已收藏
        const existing = await this.prisma.favorite.findUnique({
            where: { userId_carId: { userId, carId } },
        })
        if (existing) throw new BadRequestException('已收藏该车辆')

        return this.prisma.favorite.create({
            data: { userId, carId },
        })
    }

    // 取消收藏
    async removeFavorite(userId: number, carId: number) {
        const favorite = await this.prisma.favorite.findUnique({
            where: { userId_carId: { userId, carId } },
        })
        if (!favorite) throw new NotFoundException('未收藏该车辆')

        return this.prisma.favorite.delete({
            where: { userId_carId: { userId, carId } },
        })
    }

    // 获取收藏列表（按创建时间降序）
    async getFavorites(userId: number, query: { page?: number; pageSize?: number }) {
        const page = Number(query.page) || 1
        const pageSize = Number(query.pageSize) || 10

        const [list, total] = await Promise.all([
            this.prisma.favorite.findMany({
                where: { userId },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    car: {
                        include: {
                            brand: { select: { id: true, name: true, logo: true } },
                            series: { select: { id: true, name: true } },
                        },
                    },
                },
            }),
            this.prisma.favorite.count({ where: { userId } }),
        ])

        // 标记已下架或已售出的车辆
        const formattedList = list.map((item) => ({
            ...item,
            car: {
                ...item.car,
                isAvailable: ['on', 'approved'].includes(item.car.status),
            },
        }))

        return new PaginatedResult(formattedList, total, page, pageSize)
    }

    // 检查是否已收藏
    async checkFavorite(userId: number, carId: number) {
        const favorite = await this.prisma.favorite.findUnique({
            where: { userId_carId: { userId, carId } },
        })
        return { isFavorited: !!favorite }
    }

    // 获取用户收藏数量
    async getFavoriteCount(userId: number) {
        return this.prisma.favorite.count({ where: { userId } })
    }
}
