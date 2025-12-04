import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { PrismaService } from '../../prisma/prisma.service'
import { AdminLoginDto, UserLoginDto } from './dto/auth.dto'

@Injectable()
export class AuthService {
    // 模拟验证码存储 (生产环境应使用 Redis)
    private codeStore = new Map<string, { code: string; expireAt: number }>()

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    // 管理员登录
    async adminLogin(dto: AdminLoginDto) {
        const admin = await this.prisma.admin.findUnique({
            where: { username: dto.username },
        })

        if (!admin) {
            throw new UnauthorizedException('用户名或密码错误')
        }

        const isPasswordValid = await bcrypt.compare(dto.password, admin.password)
        if (!isPasswordValid) {
            throw new UnauthorizedException('用户名或密码错误')
        }

        if (admin.status !== 1) {
            throw new UnauthorizedException('账号已被禁用')
        }

        const token = this.jwtService.sign({
            sub: admin.id,
            type: 'admin',
            username: admin.username,
        })

        return {
            token,
            user: {
                id: admin.id,
                username: admin.username,
                nickname: admin.nickname,
                avatar: admin.avatar,
                role: admin.role,
            },
        }
    }

    // 发送验证码
    async sendCode(mobile: string) {
        // 生成6位验证码
        const code = Math.random().toString().slice(-6)
        // 5分钟有效
        this.codeStore.set(mobile, {
            code,
            expireAt: Date.now() + 5 * 60 * 1000,
        })

        // TODO: 实际发送短信
        console.log(`📱 验证码已发送到 ${mobile}: ${code}`)

        return { message: '验证码已发送' }
    }

    // 用户登录
    async userLogin(dto: UserLoginDto) {
        // 验证验证码 (开发环境允许 1234)
        const stored = this.codeStore.get(dto.mobile)
        if (dto.code !== '1234' && (!stored || stored.code !== dto.code || stored.expireAt < Date.now())) {
            throw new BadRequestException('验证码错误或已过期')
        }

        // 清除验证码
        this.codeStore.delete(dto.mobile)

        // 查找或创建用户
        let user = await this.prisma.user.findUnique({
            where: { mobile: dto.mobile },
        })

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    mobile: dto.mobile,
                    nickname: `用户${dto.mobile.slice(-4)}`,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.mobile}`,
                },
            })
        }

        if (user.status !== 1) {
            throw new UnauthorizedException('账号已被禁用')
        }

        const token = this.jwtService.sign({
            sub: user.id,
            type: 'user',
            mobile: user.mobile,
        })

        return {
            token,
            user: {
                id: user.id,
                mobile: user.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
                nickname: user.nickname,
                avatar: user.avatar,
                authStatus: user.authStatus,
                balance: user.balance,
            },
        }
    }

    // 获取当前用户信息
    async getCurrentUser(userId: number, type: 'admin' | 'user') {
        if (type === 'admin') {
            const admin = await this.prisma.admin.findUnique({ where: { id: userId } })
            if (!admin) throw new UnauthorizedException('用户不存在')
            return {
                id: admin.id,
                username: admin.username,
                nickname: admin.nickname,
                avatar: admin.avatar,
                role: admin.role,
            }
        } else {
            const user = await this.prisma.user.findUnique({ where: { id: userId } })
            if (!user) throw new UnauthorizedException('用户不存在')
            return {
                id: user.id,
                mobile: user.mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
                nickname: user.nickname,
                avatar: user.avatar,
                authStatus: user.authStatus,
                balance: user.balance,
            }
        }
    }
}
