import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class BrandService {
    constructor(private prisma: PrismaService) { }

    // 获取所有品牌
    async findAll() {
        return this.prisma.brand.findMany({
            where: { status: 1 },
            orderBy: [{ sort: 'asc' }, { initial: 'asc' }],
        })
    }

    // 获取品牌下的车系
    async findSeries(brandId: number) {
        const brand = await this.prisma.brand.findUnique({ where: { id: brandId } })
        if (!brand) throw new NotFoundException('品牌不存在')

        return this.prisma.series.findMany({
            where: { brandId, status: 1 },
            orderBy: { sort: 'asc' },
        })
    }

    // 创建品牌
    async create(data: { name: string; logo?: string; initial: string }) {
        return this.prisma.brand.create({ data })
    }

    // 创建车系
    async createSeries(brandId: number, data: { name: string }) {
        const brand = await this.prisma.brand.findUnique({ where: { id: brandId } })
        if (!brand) throw new NotFoundException('品牌不存在')

        return this.prisma.series.create({
            data: { ...data, brandId },
        })
    }
}
