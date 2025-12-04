import { IsString, IsNumber, IsOptional, IsArray, IsEnum } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'

export class CreateCarDto {
    @ApiPropertyOptional({ description: '标题（可选，不填则自动生成）' })
    @IsOptional()
    @IsString()
    title?: string

    @ApiProperty({ description: '品牌ID' })
    @IsNumber()
    brandId: number

    @ApiProperty({ description: '车系ID' })
    @IsNumber()
    seriesId: number

    @ApiProperty({ description: '首次上牌日期' })
    @IsString()
    firstRegDate: string

    @ApiProperty({ description: '里程(万公里)' })
    @IsNumber()
    mileage: number

    @ApiPropertyOptional({ description: '排量' })
    @IsOptional()
    @IsNumber()
    displacement?: number

    @ApiPropertyOptional({ description: '变速箱类型' })
    @IsOptional()
    @IsString()
    gearbox?: string

    @ApiPropertyOptional({ description: '排放标准' })
    @IsOptional()
    @IsString()
    emissionStandard?: string

    @ApiPropertyOptional({ description: '城市代码' })
    @IsOptional()
    @IsString()
    cityCode?: string

    @ApiPropertyOptional({ description: '城市名称' })
    @IsOptional()
    @IsString()
    cityName?: string

    @ApiProperty({ description: '售价(万)' })
    @IsNumber()
    price: number

    @ApiPropertyOptional({ description: '封面图' })
    @IsOptional()
    @IsString()
    coverImage?: string

    @ApiPropertyOptional({ description: '图片列表' })
    @IsOptional()
    @IsArray()
    images?: string[]

    @ApiPropertyOptional({ description: '车辆亮点' })
    @IsOptional()
    @IsString()
    highlightDesc?: string

    @ApiPropertyOptional({ description: '颜色' })
    @IsOptional()
    @IsString()
    color?: string

    @ApiPropertyOptional({ description: '配置列表' })
    @IsOptional()
    @IsArray()
    configs?: string[]
}

export class UpdateCarDto extends CreateCarDto {
    @ApiPropertyOptional({ description: '状态' })
    @IsOptional()
    @IsString()
    status?: string
}

export class QueryCarDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    page?: number = 1

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    pageSize?: number = 10

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    keyword?: string

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    brandId?: number

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    status?: string

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    sourceType?: string
}

export class AuditCarDto {
    @ApiProperty({ description: '审核结果', enum: ['approved', 'rejected'] })
    @IsEnum(['approved', 'rejected'])
    status: 'approved' | 'rejected'

    @ApiPropertyOptional({ description: '驳回原因' })
    @IsOptional()
    @IsString()
    reason?: string
}
