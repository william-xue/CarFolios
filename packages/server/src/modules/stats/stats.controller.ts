import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { StatsService } from './stats.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'

@ApiTags('统计数据')
@Controller('stats')
export class StatsController {
    constructor(private statsService: StatsService) { }

    @Get('dashboard')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取仪表盘统计数据' })
    getDashboardStats() {
        return this.statsService.getDashboardStats()
    }
}
