import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UserService } from './user.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'
import { PaginationDto } from '../../common/dto/pagination.dto'

@ApiTags('用户管理')
@Controller('users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取用户列表' })
    findAll(@Query() query: PaginationDto & { keyword?: string; authStatus?: string; status?: number }) {
        return this.userService.findAll(query)
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取用户详情' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.userService.findOne(id)
    }

    @Patch(':id/verify')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '审核用户认证' })
    verifyAuth(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { status: 'verified' | 'rejected'; reason?: string },
    ) {
        return this.userService.verifyAuth(id, body.status, body.reason)
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '启用/禁用用户' })
    updateStatus(@Param('id', ParseIntPipe) id: number, @Body() body: { status: number }) {
        return this.userService.updateStatus(id, body.status)
    }

    @Post('auth/submit')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '提交实名认证' })
    submitAuth(@CurrentUser() user: JwtPayload, @Body() body: { realName: string; idCard: string }) {
        return this.userService.submitAuth(user.sub, body)
    }
}
