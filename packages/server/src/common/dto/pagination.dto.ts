import { IsOptional, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class PaginationDto {
    @ApiPropertyOptional({ description: '页码', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1

    @ApiPropertyOptional({ description: '每页数量', default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    pageSize?: number = 10
}

export class PaginatedResult<T> {
    list: T[]
    total: number
    page: number
    pageSize: number

    constructor(list: T[], total: number, page: number, pageSize: number) {
        this.list = list
        this.total = total
        this.page = page
        this.pageSize = pageSize
    }
}
