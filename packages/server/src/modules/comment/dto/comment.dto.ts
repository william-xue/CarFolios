import { IsNotEmpty, IsString, MaxLength, IsOptional, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateCommentDto {
    @IsNotEmpty({ message: '评论内容不能为空' })
    @IsString()
    @MaxLength(500, { message: '评论内容不能超过500字' })
    content: string

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    parentId?: number
}

export class CommentListDto {
    @IsOptional()
    @Type(() => Number)
    page?: number = 1

    @IsOptional()
    @Type(() => Number)
    pageSize?: number = 10
}
