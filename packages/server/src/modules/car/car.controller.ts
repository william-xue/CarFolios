import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CarService } from './car.service'
import { CreateCarDto, UpdateCarDto, QueryCarDto, AuditCarDto } from './dto/car.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('车源管理')
@Controller('cars')
export class CarController {
    constructor(private carService: CarService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '发布车源' })
    create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCarDto) {
        return this.carService.create(user.sub, dto)
    }

    @Get()
    @ApiOperation({ summary: '获取车源列表' })
    findAll(@Query() query: QueryCarDto) {
        return this.carService.findAll(query)
    }

    @Get('on-sale')
    @ApiOperation({ summary: '获取上架车源列表' })
    findOnSale(@Query() query: QueryCarDto) {
        return this.carService.findOnSale(query)
    }

    @Get('pending')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取待审核车源列表' })
    findPending(@Query() query: QueryCarDto) {
        return this.carService.findPending(query)
    }

    @Get('my')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取我的车源' })
    findMyCars(@CurrentUser() user: JwtPayload, @Query() query: QueryCarDto) {
        return this.carService.findByUser(user.sub, query)
    }

    @Get(':id')
    @ApiOperation({ summary: '获取车源详情' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.carService.findOne(id)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '更新车源' })
    update(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser() user: JwtPayload,
        @Body() dto: UpdateCarDto,
    ) {
        const isAdmin = user.type === 'admin'
        return this.carService.update(id, user.sub, dto, isAdmin)
    }

    @Patch(':id/audit')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '审核车源' })
    audit(@Param('id', ParseIntPipe) id: number, @Body() dto: AuditCarDto) {
        return this.carService.audit(id, dto)
    }

    @Patch(':id/toggle')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '上架/下架车源' })
    toggleStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: 'on' | 'off' }) {
        return this.carService.toggleStatus(id, body.status)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '删除车源' })
    remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: JwtPayload) {
        const isAdmin = user.type === 'admin'
        return this.carService.remove(id, user.sub, isAdmin)
    }
}
