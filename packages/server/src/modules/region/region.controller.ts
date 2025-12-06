import { Controller, Get, Param, Query, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger'
import { RegionService } from './region.service'
import { SearchRegionDto } from './dto/region.dto'

@ApiTags('行政区划')
@Controller('regions')
export class RegionController {
    constructor(private readonly regionService: RegionService) { }

    @Get('provinces')
    @ApiOperation({ summary: '获取所有省份' })
    async getProvinces() {
        return this.regionService.getProvinces()
    }

    @Get('cities/:provinceId')
    @ApiOperation({ summary: '获取省份下的城市' })
    @ApiParam({ name: 'provinceId', description: '省份ID' })
    async getCities(@Param('provinceId', ParseIntPipe) provinceId: number) {
        return this.regionService.getCitiesByProvince(provinceId)
    }

    @Get('districts/:cityId')
    @ApiOperation({ summary: '获取城市下的区县' })
    @ApiParam({ name: 'cityId', description: '城市ID' })
    async getDistricts(@Param('cityId', ParseIntPipe) cityId: number) {
        return this.regionService.getDistrictsByCity(cityId)
    }

    @Get('search')
    @ApiOperation({ summary: '搜索区域（支持名称和拼音）' })
    @ApiQuery({ name: 'keyword', required: false, description: '搜索关键词' })
    @ApiQuery({ name: 'level', required: false, description: '层级: 1=省, 2=市, 3=区县' })
    async searchRegions(@Query() dto: SearchRegionDto) {
        return this.regionService.searchRegions(dto)
    }

    @Get(':id')
    @ApiOperation({ summary: '获取区域详情' })
    @ApiParam({ name: 'id', description: '区域ID' })
    async getRegion(@Param('id', ParseIntPipe) id: number) {
        return this.regionService.getRegionById(id)
    }

    @Get(':id/path')
    @ApiOperation({ summary: '获取区域完整路径（省-市-区）' })
    @ApiParam({ name: 'id', description: '区域ID' })
    async getRegionPath(@Param('id', ParseIntPipe) id: number) {
        return this.regionService.getRegionPath(id)
    }

    @Get('nearest')
    @ApiOperation({ summary: '根据坐标获取最近的区域' })
    @ApiQuery({ name: 'lat', description: '纬度' })
    @ApiQuery({ name: 'lng', description: '经度' })
    @ApiQuery({ name: 'level', required: false, description: '层级，默认3（区县）' })
    async getNearestRegion(
        @Query('lat') lat: string,
        @Query('lng') lng: string,
        @Query('level') level?: string,
    ) {
        return this.regionService.getNearestRegion(
            parseFloat(lat),
            parseFloat(lng),
            level ? parseInt(level) : 3,
        )
    }
}
