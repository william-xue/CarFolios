import { Controller, Get, Post, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { NotificationService } from './notification.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'

@ApiTags('通知')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    @ApiOperation({ summary: '获取通知列表' })
    async getNotifications(
        @CurrentUser('id') userId: number,
        @Query('page') page = 1,
        @Query('pageSize') pageSize = 10,
    ) {
        return this.notificationService.getUserNotifications(userId, +page, +pageSize)
    }

    @Get('unread-count')
    @ApiOperation({ summary: '获取未读通知数量' })
    async getUnreadCount(@CurrentUser('id') userId: number) {
        const count = await this.notificationService.getUnreadCount(userId)
        return { count }
    }

    @Post(':id/read')
    @ApiOperation({ summary: '标记通知已读' })
    async markAsRead(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        await this.notificationService.markAsRead(id, userId)
        return { success: true }
    }

    @Post('read-all')
    @ApiOperation({ summary: '标记所有通知已读' })
    async markAllAsRead(@CurrentUser('id') userId: number) {
        await this.notificationService.markAllAsRead(userId)
        return { success: true }
    }

    @Post(':id/delete')
    @ApiOperation({ summary: '删除通知' })
    async deleteNotification(
        @Param('id', ParseIntPipe) id: number,
        @CurrentUser('id') userId: number,
    ) {
        await this.notificationService.deleteNotification(id, userId)
        return { success: true }
    }
}
