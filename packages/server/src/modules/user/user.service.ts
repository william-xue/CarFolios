import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto'

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    // 获取用户列表 (管理端)
    async findAll(query: PaginationDto & { keyword?: string; authStatus?: string; status?: number }) {
        const page = Number(query.page) || 1
        const pageSize = Number(query.pageSize) || 10
        const { keyword, authStatus, status } = query

        const where: any = {}
        if (keyword) {
            where.OR = [{ mobile: { contains: keyword } }, { nickname: { contains: keyword } }]
        }
        if (authStatus) {
            where.authStatus = authStatus
        }
        if (status !== undefined) {
            where.status = Number(status)
        }

        const [list, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    mobile: true,
                    nickname: true,
                    avatar: true,
                    realName: true,
                    authStatus: true,
                    balance: true,
                    status: true,
                    createdAt: true,
                    _count: { select: { cars: true, buyOrders: true } },
                },
            }),
            this.prisma.user.count({ where }),
        ])

        return new PaginatedResult(list, total, page, pageSize)
    }

    // 获取用户详情
    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                _count: { select: { cars: true, buyOrders: true, sellOrders: true } },
            },
        })
        if (!user) throw new NotFoundException('用户不存在')
        return user
    }

    // 审核用户认证
    async verifyAuth(id: number, status: 'verified' | 'rejected', reason?: string) {
        const user = await this.prisma.user.findUnique({ where: { id } })
        if (!user) throw new NotFoundException('用户不存在')
        if (user.authStatus !== 'pending') {
            throw new BadRequestException('用户未提交认证申请')
        }

        return this.prisma.user.update({
            where: { id },
            data: { authStatus: status },
        })
    }

    // 启用/禁用用户
    async updateStatus(id: number, status: number) {
        const user = await this.prisma.user.findUnique({ where: { id } })
        if (!user) throw new NotFoundException('用户不存在')

        return this.prisma.user.update({
            where: { id },
            data: { status },
        })
    }

    // 用户提交实名认证
    async submitAuth(userId: number, data: { realName: string; idCard: string }) {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                realName: data.realName,
                idCard: data.idCard,
                authStatus: 'pending',
            },
        })
    }
}
