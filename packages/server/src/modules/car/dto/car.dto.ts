import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean, Min } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type, Transform } from 'class-transformer'

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

    @ApiPropertyOptional({ description: 'VIN码' })
    @IsOptional()
    @IsString()
    vin?: string

    @ApiPropertyOptional({ description: '车牌号' })
    @IsOptional()
    @IsString()
    plateNumber?: string

    @ApiPropertyOptional({ description: '发动机号' })
    @IsOptional()
    @IsString()
    engineNumber?: string

    @ApiPropertyOptional({ description: '省份ID' })
    @IsOptional()
    @Type(() => Number)
    provinceId?: number

    @ApiPropertyOptional({ description: '省份名称' })
    @IsOptional()
    @IsString()
    provinceName?: string

    @ApiPropertyOptional({ description: '区县ID' })
    @IsOptional()
    @Type(() => Number)
    districtId?: number

    @ApiPropertyOptional({ description: '区县名称' })
    @IsOptional()
    @IsString()
    districtName?: string

    @ApiPropertyOptional({ description: '纬度' })
    @IsOptional()
    @Type(() => Number)
    lat?: number

    @ApiPropertyOptional({ description: '经度' })
    @IsOptional()
    @Type(() => Number)
    lng?: number

    // 视频相关字段
    @ApiPropertyOptional({ description: '视频URL' })
    @IsOptional()
    @IsString()
    video?: string

    @ApiPropertyOptional({ description: '视频缩略图' })
    @IsOptional()
    @IsString()
    videoThumbnail?: string

    @ApiPropertyOptional({ description: '视频时长(秒)' })
    @IsOptional()
    @Type(() => Number)
    videoDuration?: number

    // 新增车况字段
    @ApiPropertyOptional({ description: '新车指导价(万)' })
    @IsOptional()
    @Type(() => Number)
    originalPrice?: number

    @ApiPropertyOptional({ description: '使用性质', enum: ['family', 'business', 'official'] })
    @IsOptional()
    @IsEnum(['family', 'business', 'official'])
    useType?: string

    @ApiPropertyOptional({ description: '过户次数' })
    @IsOptional()
    @Type(() => Number)
    @Min(0)
    transferCount?: number

    // 联系方式字段
    @ApiPropertyOptional({ description: '联系电话' })
    @IsOptional()
    @IsString()
    contactPhone?: string

    @ApiPropertyOptional({ description: '使用平台电话' })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    usePlatformPhone?: boolean

    // 详细地址
    @ApiPropertyOptional({ description: '详细地址' })
    @IsOptional()
    @IsString()
    address?: string

    // 城市ID
    @ApiPropertyOptional({ description: '城市ID' })
    @IsOptional()
    @Type(() => Number)
    cityId?: number
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

export class LocationQueryDto {
    @ApiPropertyOptional({ description: '省份ID' })
    @IsOptional()
    @Type(() => Number)
    provinceId?: number

    @ApiPropertyOptional({ description: '城市ID' })
    @IsOptional()
    @Type(() => Number)
    cityId?: number

    @ApiPropertyOptional({ description: '区县ID' })
    @IsOptional()
    @Type(() => Number)
    districtId?: number

    @ApiPropertyOptional({ description: '纬度' })
    @IsOptional()
    @Type(() => Number)
    lat?: number

    @ApiPropertyOptional({ description: '经度' })
    @IsOptional()
    @Type(() => Number)
    lng?: number

    @ApiPropertyOptional({ description: '搜索半径(km)' })
    @IsOptional()
    @Type(() => Number)
    radius?: number
}

export class ArchivedCarQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    page?: number = 1

    @ApiPropertyOptional()
    @IsOptional()
    @Type(() => Number)
    pageSize?: number = 10

    @ApiPropertyOptional({ description: '关键词搜索' })
    @IsOptional()
    @IsString()
    keyword?: string
}
