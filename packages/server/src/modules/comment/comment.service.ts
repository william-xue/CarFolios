import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PaginatedResult } from '../../common/dto/pagination.dto'
import { CreateCommentDto, CommentListDto } from './dto/comment.dto'

// 违禁词列表（简单示例）
const PROHIBITED_WORDS = ['违禁词1', '违禁词2', '敏感词']

@Injectable()
export class CommentService {
    constructor(private prisma: PrismaService) { }

    // 检查评论内容是否包含违禁词
    private checkProhibitedContent(content: string): boolean {
        return PROHIBITED_WORDS.some((word) => content.includes(word))
    }

    // 验证评论内容（不能为空或纯空白）
    private validateContent(content: string): void {
        if (!content || content.trim().length === 0) {
            throw new BadRequestException('评论内容不能为空')
        }
    }

    // 添加评论
    async addComment(userId: number, carId: number, dto: CreateCommentDto) {
        // 验证内容
        this.validateContent(dto.content)

        // 检查违禁词
        if (this.checkProhibitedContent(dto.content)) {
            throw new BadRequestException('评论内容包含违规词汇')
        }

        // 检查车辆是否存在
        const car = await this.prisma.car.findUnique({ where: { id: carId } })
        if (!car) throw new NotFoundException('车辆不存在')

        // 如果是回复，检查父评论是否存在
        if (dto.parentId) {
            const parentComment = await this.prisma.comment.findUnique({
                where: { id: dto.parentId },
            })
            if (!parentComment || parentComment.carId !== carId) {
                throw new BadRequestException('回复的评论不存在')
            }
        }

        return this.prisma.comment.create({
            data: {
                userId,
                carId,
                content: dto.content.trim(),
                parentId: dto.parentId,
            },
            include: {
                user: { select: { id: true, nickname: true, avatar: true } },
            },
        })
    }

    // 删除评论（只能删除自己的评论）
    async deleteComment(userId: number, commentId: number) {
        const comment = await this.prisma.comment.findUnique({
            where: { id: commentId },
        })

        if (!comment) throw new NotFoundException('评论不存在')
        if (comment.userId !== userId) throw new ForbiddenException('无权删除此评论')

        // 软删除：将状态设为0
        return this.prisma.comment.update({
            where: { id: commentId },
            data: { status: 0 },
        })
    }

    // 获取评论列表（按创建时间升序，每页10条）
    async getComments(carId: number, query: CommentListDto) {
        const page = Number(query.page) || 1
        const pageSize = Math.min(Number(query.pageSize) || 10, 10) // 最多10条

        // 检查车辆是否存在
        const car = await this.prisma.car.findUnique({ where: { id: carId } })
        if (!car) throw new NotFoundException('车辆不存在')

        // 只获取顶级评论（parentId 为 null）
        const where = {
            carId,
            status: 1,
            parentId: null,
        }

        const [list, total] = await Promise.all([
            this.prisma.comment.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'asc' },
                include: {
                    user: { select: { id: true, nickname: true, avatar: true } },
                    replies: {
                        where: { status: 1 },
                        orderBy: { createdAt: 'asc' },
                        include: {
                            user: { select: { id: true, nickname: true, avatar: true } },
                        },
                    },
                },
            }),
            this.prisma.comment.count({ where }),
        ])

        return new PaginatedResult(list, total, page, pageSize)
    }

    // 获取车辆评论数量
    async getCommentCount(carId: number) {
        return this.prisma.comment.count({
            where: { carId, status: 1 },
        })
    }
}
