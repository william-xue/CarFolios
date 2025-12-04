import { Controller, Get, Post, Param, Body, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { BrandService } from './brand.service'

@ApiTags('品牌车系')
@Controller('brands')
export class BrandController {
    constructor(private brandService: BrandService) { }

    @Get()
    @ApiOperation({ summary: '获取所有品牌' })
    findAll() {
        return this.brandService.findAll()
    }

    @Get(':id/series')
    @ApiOperation({ summary: '获取品牌下的车系' })
    findSeries(@Param('id', ParseIntPipe) id: number) {
        return this.brandService.findSeries(id)
    }

    @Post()
    @ApiOperation({ summary: '创建品牌' })
    create(@Body() body: { name: string; logo?: string; initial: string }) {
        return this.brandService.create(body)
    }

    @Post(':id/series')
    @ApiOperation({ summary: '创建车系' })
    createSeries(@Param('id', ParseIntPipe) id: number, @Body() body: { name: string }) {
        return this.brandService.createSeries(id, body)
    }
}
