import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { CommentService } from './comment.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'
import { CreateCommentDto, CommentListDto } from './dto/comment.dto'

@ApiTags('评论管理')
@Controller('comments')
export class CommentController {
    constructor(private commentService: CommentService) { }

    @Post('car/:carId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '添加评论' })
    addComment(
        @CurrentUser() user: JwtPayload,
        @Param('carId', ParseIntPipe) carId: number,
        @Body() dto: CreateCommentDto,
    ) {
        return this.commentService.addComment(user.sub, carId, dto)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '删除评论' })
    deleteComment(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
        return this.commentService.deleteComment(user.sub, id)
    }

    @Get('car/:carId')
    @ApiOperation({ summary: '获取车辆评论列表' })
    getComments(@Param('carId', ParseIntPipe) carId: number, @Query() query: CommentListDto) {
        return this.commentService.getComments(carId, query)
    }

    @Get('car/:carId/count')
    @ApiOperation({ summary: '获取车辆评论数量' })
    getCommentCount(@Param('carId', ParseIntPipe) carId: number) {
        return this.commentService.getCommentCount(carId)
    }
}
