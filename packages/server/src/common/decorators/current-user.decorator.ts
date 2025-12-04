import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface JwtPayload {
    sub: number
    type: 'admin' | 'user'
    username?: string
    mobile?: string
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
})
