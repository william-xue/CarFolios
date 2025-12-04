import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 开始初始化数据...')

    // 创建管理员
    const adminPassword = await bcrypt.hash('123456', 10)
    await prisma.admin.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPassword,
            nickname: '超级管理员',
            role: 'super_admin',
        },
    })
    console.log('✅ 管理员创建成功 (admin / 123456)')

    // 创建品牌
    const brands = [
        { name: '宝马', logo: 'https://img.icons8.com/color/96/bmw.png', initial: 'B' },
        { name: '奔驰', logo: 'https://img.icons8.com/color/96/mercedes-benz.png', initial: 'B' },
        { name: '奥迪', logo: 'https://img.icons8.com/color/96/audi.png', initial: 'A' },
        { name: '大众', logo: 'https://img.icons8.com/color/96/volkswagen.png', initial: 'D' },
        { name: '丰田', logo: 'https://img.icons8.com/color/96/toyota.png', initial: 'F' },
        { name: '本田', logo: 'https://img.icons8.com/color/96/honda.png', initial: 'B' },
        { name: '特斯拉', logo: 'https://img.icons8.com/color/96/tesla-logo.png', initial: 'T' },
        { name: '比亚迪', logo: '', initial: 'B' },
    ]

    for (const brand of brands) {
        await prisma.brand.upsert({
            where: { name: brand.name },
            update: {},
            create: brand,
        })
    }
    console.log('✅ 品牌数据创建成功')

    // 创建车系
    const bmw = await prisma.brand.findUnique({ where: { name: '宝马' } })
    const benz = await prisma.brand.findUnique({ where: { name: '奔驰' } })
    const audi = await prisma.brand.findUnique({ where: { name: '奥迪' } })

    if (bmw) {
        const bmwSeries = ['3系', '5系', '7系', 'X3', 'X5']
        for (const name of bmwSeries) {
            await prisma.series.upsert({
                where: { id: 0 },
                update: {},
                create: { brandId: bmw.id, name },
            })
        }
    }

    if (benz) {
        const benzSeries = ['C级', 'E级', 'S级', 'GLC', 'GLE']
        for (const name of benzSeries) {
            await prisma.series.upsert({
                where: { id: 0 },
                update: {},
                create: { brandId: benz.id, name },
            })
        }
    }

    if (audi) {
        const audiSeries = ['A4L', 'A6L', 'A8L', 'Q5L', 'Q7']
        for (const name of audiSeries) {
            await prisma.series.upsert({
                where: { id: 0 },
                update: {},
                create: { brandId: audi.id, name },
            })
        }
    }
    console.log('✅ 车系数据创建成功')

    // 创建测试用户
    await prisma.user.upsert({
        where: { mobile: '13800138000' },
        update: {},
        create: {
            mobile: '13800138000',
            nickname: '测试用户',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
            authStatus: 'verified',
            realName: '张三',
        },
    })
    console.log('✅ 测试用户创建成功 (13800138000)')

    console.log('🎉 数据初始化完成!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
