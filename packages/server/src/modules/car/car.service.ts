import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateCarDto, UpdateCarDto, QueryCarDto, AuditCarDto } from './dto/car.dto'
import { PaginatedResult } from '../../common/dto/pagination.dto'

@Injectable()
export class CarService {
    constructor(private prisma: PrismaService) { }

    // 创建车源
    async create(userId: number, dto: CreateCarDto) {
        // 如果没有提供标题，自动生成
        let title = dto.title
        if (!title) {
            const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } })
            const series = await this.prisma.series.findUnique({ where: { id: dto.seriesId } })
            const year = dto.firstRegDate?.split('-')[0] || new Date().getFullYear()
            title = `${brand?.name || ''} ${series?.name || ''} ${year}款`
        }

        return this.prisma.car.create({
            data: {
                ...dto,
                title,
                ownerId: userId,
                coverImage: dto.images?.[0] || null,
                images: dto.images ? JSON.stringify(dto.images) : null,
                configs: dto.configs ? JSON.stringify(dto.configs) : null,
                status: 'pending',
            },
        })
    }

    // 获取车源列表
    async findAll(query: QueryCarDto) {
        const { page = 1, pageSize = 10, keyword, brandId, status, sourceType } = query

        const where: any = {}
        if (keyword) {
            where.title = { contains: keyword }
        }
        if (brandId) {
            where.brandId = brandId
        }
        if (status) {
            where.status = status
        }
        if (sourceType) {
            where.sourceType = sourceType
        }

        const [list, total] = await Promise.all([
            this.prisma.car.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    brand: { select: { id: true, name: true } },
                    series: { select: { id: true, name: true } },
                    owner: { select: { id: true, nickname: true, mobile: true } },
                },
            }),
            this.prisma.car.count({ where }),
        ])

        // 解析 JSON 字段
        const parsedList = list.map((car) => ({
            ...car,
            images: car.images ? JSON.parse(car.images) : [],
            configs: car.configs ? JSON.parse(car.configs) : [],
        }))

        return new PaginatedResult(parsedList, total, page, pageSize)
    }

    // 获取上架车源列表 (用户端)
    async findOnSale(query: QueryCarDto) {
        return this.findAll({ ...query, status: 'on' })
    }

    // 获取待审核车源列表
    async findPending(query: QueryCarDto) {
        return this.findAll({ ...query, status: 'pending' })
    }

    // 获取车源详情
    async findOne(id: number) {
        const car = await this.prisma.car.findUnique({
            where: { id },
            include: {
                brand: true,
                series: true,
                owner: { select: { id: true, nickname: true, mobile: true, avatar: true } },
            },
        })

        if (!car) throw new NotFoundException('车源不存在')

        return {
            ...car,
            images: car.images ? JSON.parse(car.images) : [],
            configs: car.configs ? JSON.parse(car.configs) : [],
        }
    }

    // 更新车源
    async update(id: number, userId: number, dto: UpdateCarDto, isAdmin = false) {
        const car = await this.prisma.car.findUnique({ where: { id } })
        if (!car) throw new NotFoundException('车源不存在')

        if (!isAdmin && car.ownerId !== userId) {
            throw new ForbiddenException('无权操作此车源')
        }

        return this.prisma.car.update({
            where: { id },
            data: {
                ...dto,
                images: dto.images ? JSON.stringify(dto.images) : undefined,
                configs: dto.configs ? JSON.stringify(dto.configs) : undefined,
            },
        })
    }

    // 审核车源
    async audit(id: number, dto: AuditCarDto) {
        const car = await this.prisma.car.findUnique({ where: { id } })
        if (!car) throw new NotFoundException('车源不存在')

        const newStatus = dto.status === 'approved' ? 'on' : 'rejected'

        return this.prisma.car.update({
            where: { id },
            data: {
                status: newStatus,
                rejectReason: dto.status === 'rejected' ? dto.reason : null,
            },
        })
    }

    // 上架/下架
    async toggleStatus(id: number, status: 'on' | 'off') {
        const car = await this.prisma.car.findUnique({ where: { id } })
        if (!car) throw new NotFoundException('车源不存在')

        return this.prisma.car.update({
            where: { id },
            data: { status },
        })
    }

    // 删除车源
    async remove(id: number, userId: number, isAdmin = false) {
        const car = await this.prisma.car.findUnique({ where: { id } })
        if (!car) throw new NotFoundException('车源不存在')

        if (!isAdmin && car.ownerId !== userId) {
            throw new ForbiddenException('无权操作此车源')
        }

        return this.prisma.car.delete({ where: { id } })
    }

    // 获取用户的车源
    async findByUser(userId: number, query: QueryCarDto) {
        return this.findAll({ ...query, sourceType: undefined })
    }
}
