import { Controller, Post, Get, Body, Param, Query, ParseIntPipe, Req, UseGuards } from '@nestjs/common'
import { PaymentService } from './payment.service'
import { CreatePaymentDto } from './dto/create-payment.dto'
import { PaymentQueryDto } from './dto/payment-query.dto'
import { RefundDto } from './dto/refund.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Request } from 'express'

@Controller('payments')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    /**
     * 创建支付订单
     * POST /payments/create
     */
    @Post('create')
    @UseGuards(JwtAuthGuard)
    async createPayment(
        @Body() dto: CreatePaymentDto,
        @CurrentUser() user: { id: number },
        @Req() req: Request,
    ) {
        // 获取客户端 IP
        const clientIp = req.ip || req.headers['x-forwarded-for']?.toString() || ''
        dto.clientIp = clientIp

        return this.paymentService.createPayment(dto, user.id)
    }

    /**
     * 查询支付状态
     * GET /payments/:id/status
     */
    @Get(':id/status')
    @UseGuards(JwtAuthGuard)
    async getPaymentStatus(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.getPaymentStatus(id)
    }

    /**
     * 主动查询支付渠道状态
     * POST /payments/:id/query
     */
    @Post(':id/query')
    @UseGuards(JwtAuthGuard)
    async queryPayment(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.queryPaymentFromChannel(id)
    }

    /**
     * 获取支付订单列表（管理后台）
     * GET /payments
     */
    @Get()
    @UseGuards(JwtAuthGuard)
    async getPaymentList(@Query() query: PaymentQueryDto) {
        return this.paymentService.getPaymentList(query)
    }

    /**
     * 获取支付订单详情
     * GET /payments/:id
     */
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async getPaymentDetail(@Param('id', ParseIntPipe) id: number) {
        return this.paymentService.getPaymentDetail(id)
    }

    /**
     * 发起退款（管理后台）
     * POST /payments/:id/refund
     */
    @Post(':id/refund')
    @UseGuards(JwtAuthGuard)
    async refund(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: RefundDto,
        @CurrentUser() user: { id: number },
    ) {
        return this.paymentService.refund(id, dto, user.id)
    }
}
