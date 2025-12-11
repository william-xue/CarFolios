import { Controller, Get, Post, Delete, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { FavoriteService } from './favorite.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'

@ApiTags('收藏管理')
@Controller('favorites')
export class FavoriteController {
    constructor(private favoriteService: FavoriteService) { }

    @Post(':carId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '添加收藏' })
    addFavorite(@CurrentUser() user: JwtPayload, @Param('carId', ParseIntPipe) carId: number) {
        return this.favoriteService.addFavorite(user.sub, carId)
    }

    @Delete(':carId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '取消收藏' })
    removeFavorite(@CurrentUser() user: JwtPayload, @Param('carId', ParseIntPipe) carId: number) {
        return this.favoriteService.removeFavorite(user.sub, carId)
    }

    @Get()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取收藏列表' })
    getFavorites(@CurrentUser() user: JwtPayload, @Query() query: { page?: number; pageSize?: number }) {
        return this.favoriteService.getFavorites(user.sub, query)
    }

    @Get('check/:carId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '检查是否已收藏' })
    checkFavorite(@CurrentUser() user: JwtPayload, @Param('carId', ParseIntPipe) carId: number) {
        return this.favoriteService.checkFavorite(user.sub, carId)
    }

    @Get('count')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '获取收藏数量' })
    getFavoriteCount(@CurrentUser() user: JwtPayload) {
        return this.favoriteService.getFavoriteCount(user.sub)
    }
}
