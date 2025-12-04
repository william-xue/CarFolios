import { IsString, IsNotEmpty, Length, IsMobilePhone } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

// 管理员登录
export class AdminLoginDto {
    @ApiProperty({ description: '用户名' })
    @IsString()
    @IsNotEmpty({ message: '用户名不能为空' })
    username: string

    @ApiProperty({ description: '密码' })
    @IsString()
    @IsNotEmpty({ message: '密码不能为空' })
    password: string
}

// 用户手机号登录
export class UserLoginDto {
    @ApiProperty({ description: '手机号' })
    @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
    mobile: string

    @ApiProperty({ description: '验证码' })
    @IsString()
    @Length(4, 6, { message: '验证码长度为4-6位' })
    code: string
}

// 发送验证码
export class SendCodeDto {
    @ApiProperty({ description: '手机号' })
    @IsMobilePhone('zh-CN', {}, { message: '手机号格式不正确' })
    mobile: string
}
