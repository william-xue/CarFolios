import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { OrderService } from './order.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('订单管理')
@Controller('orders')
export class OrderController {
    constructor(private orderService: OrderService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '创建订单' })
    create(@CurrentUser() user: JwtPayload, @Body() body: { carId: number; depositAmount: number }) {
        return this.orderService.create(user.sub, body.carId, body.depositAmount)
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取订单列表' })
    findAll(@Query() query: { page?: number; pageSize?: number; status?: string; keyword?: string }) {
        return this.orderService.findAll(query)
    }

    @Get('my/buy')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取我的购买订单' })
    findMyBuyOrders(@CurrentUser() user: JwtPayload, @Query() query: { page?: number; pageSize?: number; status?: string }) {
        return this.orderService.findByUser(user.sub, 'buy', query)
    }

    @Get('my/sell')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取我的出售订单' })
    findMySellOrders(@CurrentUser() user: JwtPayload, @Query() query: { page?: number; pageSize?: number; status?: string }) {
        return this.orderService.findByUser(user.sub, 'sell', query)
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取订单详情' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.findOne(id)
    }

    @Patch(':id/pay')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '支付订单' })
    pay(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
        return this.orderService.pay(id, user.sub)
    }

    @Patch(':id/complete')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '完成订单' })
    complete(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.complete(id)
    }

    @Patch(':id/cancel')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '取消订单' })
    cancel(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
        const isAdmin = user.type === 'admin'
        return this.orderService.cancel(id, isAdmin ? undefined : user.sub)
    }

    @Patch(':id/refund')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '退款' })
    refund(@Param('id', ParseIntPipe) id: number) {
        return this.orderService.refund(id)
    }
}
