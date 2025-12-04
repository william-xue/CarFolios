import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../../prisma/prisma.service'
import { CreatePaymentDto, CreatePaymentResponse } from './dto/create-payment.dto'
import { PaymentQueryDto, PaymentStatusResponse, QueryPaymentResponse } from './dto/payment-query.dto'
import { RefundDto, RefundResponse, RefundStatus } from './dto/refund.dto'
import { PaymentChannel } from './constants/payment-channel'
import { PaymentStatus, PaymentLogAction, canTransitionTo } from './constants/payment-status'

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name)
    // 支付订单过期时间（分钟）
    private readonly PAYMENT_EXPIRE_MINUTES = 30

    constructor(private prisma: PrismaService) { }

    /**
     * 定时任务：每分钟检查并关闭超时支付订单
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredPayments() {
        try {
            const closedCount = await this.closeExpiredPayments()
            if (closedCount > 0) {
                this.logger.log(`已关闭 ${closedCount} 个超时支付订单`)
            }
        } catch (error) {
            this.logger.error('关闭超时支付订单失败', error)
        }
    }

    /**
     * 生成唯一支付订单号（≤32位）
     * 格式：PAY + 时间戳(13位) + 随机数(6位) = 22位
     */
    generatePaymentNo(): string {
        const timestamp = Date.now().toString()
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
        return `PAY${timestamp}${random}`
    }

    /**
     * 创建支付订单
     */
    async createPayment(dto: CreatePaymentDto, userId: number): Promise<CreatePaymentResponse> {
        // 1. 查询业务订单
        const order = await this.prisma.order.findUnique({
            where: { id: dto.orderId },
        })

        if (!order) {
            throw new NotFoundException('业务订单不存在')
        }

        // 2. 校验订单状态（仅 pending 状态可支付）
        if (order.status !== 'pending') {
            throw new BadRequestException('订单状态不允许支付')
        }

        // 3. 校验用户是否为订单买家
        if (order.buyerId !== userId) {
            throw new BadRequestException('无权支付此订单')
        }

        // 4. 关闭该订单的旧支付订单（如果存在未完成的）
        await this.prisma.payment.updateMany({
            where: {
                orderId: dto.orderId,
                status: PaymentStatus.PENDING,
            },
            data: {
                status: PaymentStatus.CLOSED,
                closedAt: new Date(),
            },
        })

        // 5. 计算金额（元转分）
        const amountInCents = Math.round(order.depositAmount * 100)

        // 6. 计算过期时间
        const expireTime = new Date(Date.now() + this.PAYMENT_EXPIRE_MINUTES * 60 * 1000)

        // 7. 创建新支付订单
        const paymentNo = this.generatePaymentNo()
        const payment = await this.prisma.payment.create({
            data: {
                paymentNo,
                orderId: dto.orderId,
                userId,
                channel: dto.channel,
                clientType: dto.clientType,
                amount: amountInCents,
                status: PaymentStatus.PENDING,
                clientIp: dto.clientIp,
                expireTime,
            },
        })

        // 8. 记录创建日志
        await this.createPaymentLog(payment.id, PaymentLogAction.CREATE, PaymentStatus.PENDING, null, dto.clientIp)

        // 9. 调用支付渠道获取支付参数（后续实现）
        const response: CreatePaymentResponse = {
            paymentId: payment.id,
            paymentNo: payment.paymentNo,
            channel: dto.channel,
            amount: amountInCents,
            expireTime: expireTime.toISOString(),
        }

        // TODO: 根据渠道调用微信/支付宝服务获取支付参数
        if (dto.channel === PaymentChannel.WECHAT) {
            response.wechatParams = {
                // 后续由 WechatPayService 填充
            }
        } else if (dto.channel === PaymentChannel.ALIPAY) {
            response.alipayParams = {
                // 后续由 AlipayService 填充
            }
        }

        return response
    }

    /**
     * 获取支付状态
     */
    async getPaymentStatus(paymentId: number): Promise<PaymentStatusResponse> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: { order: true },
        })

        if (!payment) {
            throw new NotFoundException('支付订单不存在')
        }

        return {
            paymentId: payment.id,
            paymentNo: payment.paymentNo,
            status: payment.status as PaymentStatus,
            paidAt: payment.paidAt?.toISOString(),
            orderId: payment.orderId,
            orderStatus: payment.order.status,
        }
    }

    /**
     * 主动查询支付渠道状态
     */
    async queryPaymentFromChannel(paymentId: number): Promise<QueryPaymentResponse> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        })

        if (!payment) {
            throw new NotFoundException('支付订单不存在')
        }

        // TODO: 调用支付渠道查询接口
        // 这里先返回本地状态，后续由具体渠道服务实现
        return {
            paymentId: payment.id,
            status: payment.status as PaymentStatus,
            channelStatus: payment.status,
            synced: false,
        }
    }

    /**
     * 处理支付成功
     */
    async handlePaymentSuccess(paymentNo: string, channelTradeNo: string, paidAmount?: number): Promise<void> {
        const payment = await this.prisma.payment.findUnique({
            where: { paymentNo },
            include: { order: true },
        })

        if (!payment) {
            throw new NotFoundException('支付订单不存在')
        }

        // 幂等性检查：已支付则直接返回
        if (payment.status === PaymentStatus.PAID) {
            return
        }

        // 状态校验
        if (!canTransitionTo(payment.status as PaymentStatus, PaymentStatus.PAID)) {
            throw new BadRequestException('支付订单状态不允许更新为已支付')
        }

        // 金额校验（如果提供了支付金额）
        if (paidAmount !== undefined && paidAmount !== payment.amount) {
            throw new BadRequestException('支付金额与订单金额不一致')
        }

        const now = new Date()

        // 更新支付订单状态
        await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: PaymentStatus.PAID,
                channelTradeNo,
                paidAt: now,
            },
        })

        // 同步更新业务订单状态
        await this.prisma.order.update({
            where: { id: payment.orderId },
            data: {
                status: 'paid',
                payTime: now,
            },
        })

        // 记录回调日志
        await this.createPaymentLog(
            payment.id,
            PaymentLogAction.CALLBACK,
            payment.status,
            PaymentStatus.PAID,
            null,
            JSON.stringify({ channelTradeNo, paidAmount }),
        )
    }

    /**
     * 关闭超时支付订单
     */
    async closeExpiredPayments(): Promise<number> {
        const expireTime = new Date(Date.now() - this.PAYMENT_EXPIRE_MINUTES * 60 * 1000)

        const result = await this.prisma.payment.updateMany({
            where: {
                status: PaymentStatus.PENDING,
                createdAt: { lt: expireTime },
            },
            data: {
                status: PaymentStatus.CLOSED,
                closedAt: new Date(),
            },
        })

        return result.count
    }

    /**
     * 发起退款
     */
    async refund(paymentId: number, dto: RefundDto, operatorId?: number): Promise<RefundResponse> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
        })

        if (!payment) {
            throw new NotFoundException('支付订单不存在')
        }

        // 状态校验
        if (!canTransitionTo(payment.status as PaymentStatus, PaymentStatus.REFUNDED)) {
            throw new BadRequestException('支付订单状态不允许退款')
        }

        // 计算退款金额
        const refundAmount = dto.amount ?? payment.amount
        const alreadyRefunded = payment.refundAmount ?? 0
        const maxRefundable = payment.amount - alreadyRefunded

        if (refundAmount <= 0 || refundAmount > maxRefundable) {
            throw new BadRequestException('退款金额无效')
        }

        // TODO: 调用支付渠道退款接口
        // 这里先模拟退款成功
        const refundId = `REF${Date.now()}`

        // 更新支付订单
        const isFullRefund = refundAmount === payment.amount
        await this.prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: isFullRefund ? PaymentStatus.REFUNDED : payment.status,
                refundAmount: alreadyRefunded + refundAmount,
                refundReason: dto.reason,
                refundedAt: isFullRefund ? new Date() : undefined,
            },
        })

        // 如果全额退款，同步更新业务订单状态
        if (isFullRefund) {
            await this.prisma.order.update({
                where: { id: payment.orderId },
                data: { status: 'refunded' },
            })
        }

        // 记录退款日志
        await this.createPaymentLog(
            paymentId,
            PaymentLogAction.REFUND,
            payment.status,
            isFullRefund ? PaymentStatus.REFUNDED : null,
            null,
            JSON.stringify({ refundId, refundAmount, reason: dto.reason }),
            null,
            operatorId,
        )

        return {
            refundId,
            status: RefundStatus.SUCCESS,
            amount: refundAmount,
        }
    }

    /**
     * 获取支付订单列表（管理后台）
     */
    async getPaymentList(query: PaymentQueryDto) {
        const { page = 1, pageSize = 10, status, channel, paymentNo, orderNo, startDate, endDate } = query

        const where: any = {}

        if (status) where.status = status
        if (channel) where.channel = channel
        if (paymentNo) where.paymentNo = { contains: paymentNo }
        if (orderNo) {
            where.order = { orderNo: { contains: orderNo } }
        }
        if (startDate || endDate) {
            where.createdAt = {}
            if (startDate) where.createdAt.gte = new Date(startDate)
            if (endDate) where.createdAt.lte = new Date(endDate + 'T23:59:59')
        }

        const [total, list] = await Promise.all([
            this.prisma.payment.count({ where }),
            this.prisma.payment.findMany({
                where,
                include: {
                    order: { select: { orderNo: true, carTitle: true } },
                    user: { select: { id: true, nickname: true, mobile: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
        ])

        return {
            list,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        }
    }

    /**
     * 获取支付订单详情
     */
    async getPaymentDetail(paymentId: number) {
        const payment = await this.prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                order: true,
                user: { select: { id: true, nickname: true, mobile: true } },
                logs: { orderBy: { createdAt: 'desc' } },
            },
        })

        if (!payment) {
            throw new NotFoundException('支付订单不存在')
        }

        return payment
    }

    /**
     * 创建支付日志
     */
    async createPaymentLog(
        paymentId: number,
        action: PaymentLogAction,
        status: string,
        newStatus?: string | null,
        clientIp?: string | null,
        requestData?: string | null,
        responseData?: string | null,
        operatorId?: number | null,
    ) {
        return this.prisma.paymentLog.create({
            data: {
                paymentId,
                action,
                status,
                newStatus,
                clientIp,
                requestData: requestData ? this.sanitizeLogData(requestData) : null,
                responseData: responseData ? this.sanitizeLogData(responseData) : null,
                operatorId,
            },
        })
    }

    /**
     * 脱敏日志数据
     */
    private sanitizeLogData(data: string): string {
        // 脱敏银行卡号（保留前6后4）
        let sanitized = data.replace(/\b(\d{6})\d{6,}(\d{4})\b/g, '$1******$2')
        // 脱敏手机号（保留前3后4）
        sanitized = sanitized.replace(/\b(\d{3})\d{4}(\d{4})\b/g, '$1****$2')
        // 脱敏密钥类字段
        sanitized = sanitized.replace(/(key|secret|password|token)["']?\s*[:=]\s*["']?[^"',}\s]+/gi, '$1: [REDACTED]')
        return sanitized
    }
}
