import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { AdminLoginDto, UserLoginDto, SendCodeDto } from './dto/auth.dto'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('认证')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('admin/login')
    @ApiOperation({ summary: '管理员登录' })
    adminLogin(@Body() dto: AdminLoginDto) {
        return this.authService.adminLogin(dto)
    }

    @Post('send-code')
    @ApiOperation({ summary: '发送验证码' })
    sendCode(@Body() dto: SendCodeDto) {
        return this.authService.sendCode(dto.mobile)
    }

    @Post('user/login')
    @ApiOperation({ summary: '用户登录' })
    userLogin(@Body() dto: UserLoginDto) {
        return this.authService.userLogin(dto)
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取当前用户信息' })
    getCurrentUser(@CurrentUser() user: JwtPayload) {
        return this.authService.getCurrentUser(user.sub, user.type)
    }
}
