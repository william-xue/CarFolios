import { IsString, IsOptional, IsNumber } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class SearchRegionDto {
    @ApiPropertyOptional({ description: '搜索关键词（名称或拼音）' })
    @IsOptional()
    @IsString()
    keyword?: string

    @ApiPropertyOptional({ description: '层级: 1=省, 2=市, 3=区县' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    level?: number
}

export class RegionResponseDto {
    id: number
    name: string
    parentId: number | null
    level: number
    pinyin: string | null
    lat: number | null
    lng: number | null
}
