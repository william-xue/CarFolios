import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 示例车辆图片
const carImages = [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
    'https://images.unsplash.com/photo-1542362567-b07e54358753?w=800',
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800',
    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
]

// 随机选择图片
function randomImages(count: number = 5): string[] {
    const shuffled = [...carImages].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

// 生成订单号
function generateOrderNo(): string {
    const date = new Date()
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `ORD${dateStr}${random}`
}

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
        { name: '比亚迪', logo: 'https://img.icons8.com/color/96/car.png', initial: 'B' },
    ]

    for (const brand of brands) {
        await prisma.brand.upsert({
            where: { name: brand.name },
            update: { logo: brand.logo },
            create: brand,
        })
    }
    console.log('✅ 品牌数据创建成功')

    // 获取品牌
    const bmw = await prisma.brand.findUnique({ where: { name: '宝马' } })
    const benz = await prisma.brand.findUnique({ where: { name: '奔驰' } })
    const audi = await prisma.brand.findUnique({ where: { name: '奥迪' } })
    const volkswagen = await prisma.brand.findUnique({ where: { name: '大众' } })
    const toyota = await prisma.brand.findUnique({ where: { name: '丰田' } })

    // 创建车系
    const seriesData: { brandId: number; name: string }[] = []

    if (bmw) {
        ['3系', '5系', '7系', 'X3', 'X5'].forEach(name => {
            seriesData.push({ brandId: bmw.id, name })
        })
    }
    if (benz) {
        ['C级', 'E级', 'S级', 'GLC', 'GLE'].forEach(name => {
            seriesData.push({ brandId: benz.id, name })
        })
    }
    if (audi) {
        ['A4L', 'A6L', 'A8L', 'Q5L', 'Q7'].forEach(name => {
            seriesData.push({ brandId: audi.id, name })
        })
    }
    if (volkswagen) {
        ['迈腾', '帕萨特', '途观L', '探岳'].forEach(name => {
            seriesData.push({ brandId: volkswagen.id, name })
        })
    }
    if (toyota) {
        ['凯美瑞', '雷克萨斯', '汉兰达', 'RAV4'].forEach(name => {
            seriesData.push({ brandId: toyota.id, name })
        })
    }

    // 清空并重新创建车系
    await prisma.series.deleteMany({})
    for (const s of seriesData) {
        await prisma.series.create({ data: s })
    }
    console.log('✅ 车系数据创建成功')

    // 创建测试用户
    const users = [
        { mobile: '13800138000', nickname: '张先生', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhang', authStatus: 'verified', realName: '张三' },
        { mobile: '13800138001', nickname: '李女士', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=li', authStatus: 'verified', realName: '李四' },
        { mobile: '13800138002', nickname: '王先生', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wang', authStatus: 'pending', realName: '王五' },
        { mobile: '13800138003', nickname: '赵女士', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhao', authStatus: 'unverified' },
        { mobile: '13800138004', nickname: '刘先生', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=liu', authStatus: 'verified', realName: '刘六' },
    ]

    for (const user of users) {
        await prisma.user.upsert({
            where: { mobile: user.mobile },
            update: {},
            create: user,
        })
    }
    console.log('✅ 测试用户创建成功')

    // 获取用户和车系
    const allUsers = await prisma.user.findMany()
    const allSeries = await prisma.series.findMany({ include: { brand: true } })

    // 清空现有车源和订单
    await prisma.order.deleteMany({})
    await prisma.car.deleteMany({})

    // 创建演示车源
    const carConfigs = ['全景天窗', '真皮座椅', '座椅加热', '倒车影像', '360全景影像', '定速巡航', '导航系统', 'CarPlay', '无钥匙进入', '一键启动']
    const cities = [
        { code: '110000', name: '北京' },
        { code: '310000', name: '上海' },
        { code: '440100', name: '广州' },
        { code: '440300', name: '深圳' },
        { code: '330100', name: '杭州' },
    ]
    const gearboxes = ['AT', 'MT', 'DCT', 'CVT']
    const emissions = ['国五', '国六']
    const colors = ['白色', '黑色', '银色', '蓝色', '红色']

    const carsToCreate = [
        // 已上架车源
        { title: '宝马5系 2021款 530Li 豪华套装', price: 38.8, mileage: 2.5, year: '2021-03', status: 'on' },
        { title: '奔驰E级 2022款 E300L 运动版', price: 42.5, mileage: 1.8, year: '2022-06', status: 'on' },
        { title: '奥迪A6L 2021款 45TFSI 臻选版', price: 35.9, mileage: 3.2, year: '2021-08', status: 'on' },
        { title: '宝马3系 2022款 325Li M运动套装', price: 28.5, mileage: 1.5, year: '2022-03', status: 'on' },
        { title: '奔驰C级 2021款 C260L 运动版', price: 26.8, mileage: 2.8, year: '2021-05', status: 'on' },
        { title: '大众迈腾 2022款 380TSI 旗舰版', price: 22.5, mileage: 1.2, year: '2022-01', status: 'on' },
        { title: '丰田凯美瑞 2021款 2.5G 豪华版', price: 18.9, mileage: 3.5, year: '2021-04', status: 'on' },
        { title: '奥迪Q5L 2022款 45TFSI 豪华版', price: 39.8, mileage: 1.0, year: '2022-08', status: 'on' },
        // 待审核车源
        { title: '宝马X5 2023款 xDrive40Li', price: 68.8, mileage: 0.5, year: '2023-02', status: 'pending' },
        { title: '奔驰GLC 2022款 GLC300L 4MATIC', price: 45.5, mileage: 1.5, year: '2022-09', status: 'pending' },
        { title: '大众途观L 2021款 380TSI 四驱旗舰', price: 24.8, mileage: 2.0, year: '2021-11', status: 'pending' },
        // 已下架车源
        { title: '奥迪A4L 2020款 40TFSI 时尚版', price: 23.5, mileage: 4.5, year: '2020-06', status: 'off' },
        // 已售出车源
        { title: '宝马7系 2021款 740Li 尊享版', price: 85.0, mileage: 2.0, year: '2021-01', status: 'sold' },
    ]

    const createdCars: any[] = []
    for (let i = 0; i < carsToCreate.length; i++) {
        const carData = carsToCreate[i]
        const series = allSeries[i % allSeries.length]
        const owner = allUsers[i % allUsers.length]
        const city = cities[i % cities.length]
        const images = randomImages(5)

        const car = await prisma.car.create({
            data: {
                title: carData.title,
                ownerId: owner.id,
                sourceType: i % 3 === 0 ? 'platform' : (i % 3 === 1 ? 'personal' : 'dealer'),
                brandId: series.brandId,
                seriesId: series.id,
                firstRegDate: carData.year,
                mileage: carData.mileage,
                displacement: 2.0 + (i % 3) * 0.5,
                gearbox: gearboxes[i % gearboxes.length],
                emissionStandard: emissions[i % emissions.length],
                useType: 'family',
                transferCount: i % 3,
                cityCode: city.code,
                cityName: city.name,
                price: carData.price,
                originalPrice: carData.price * 1.5,
                status: carData.status,
                coverImage: images[0],
                images: JSON.stringify(images),
                highlightDesc: `一手车主，全程4S店保养，无事故无泡水，车况极佳。配置丰富，${carConfigs.slice(0, 5).join('、')}等配置齐全。`,
                color: colors[i % colors.length],
                plateCity: city.name.slice(0, 1),
                configs: JSON.stringify(carConfigs.slice(0, 6 + (i % 4))),
            },
        })
        createdCars.push(car)
    }
    console.log(`✅ 创建了 ${createdCars.length} 个演示车源`)

    // 创建演示订单
    const ordersToCreate = [
        { status: 'pending', depositAmount: 5000 },
        { status: 'paid', depositAmount: 5000 },
        { status: 'paid', depositAmount: 10000 },
        { status: 'closed', depositAmount: 5000 },
        { status: 'closed', depositAmount: 8000 },
        { status: 'cancelled', depositAmount: 5000 },
    ]

    for (let i = 0; i < ordersToCreate.length; i++) {
        const orderData = ordersToCreate[i]
        const car = createdCars[i % createdCars.length]
        const buyer = allUsers[(i + 1) % allUsers.length]
        const seller = allUsers[i % allUsers.length]

        await prisma.order.create({
            data: {
                orderNo: generateOrderNo() + i,
                carId: car.id,
                buyerId: buyer.id,
                sellerId: seller.id,
                carTitle: car.title,
                carImage: car.coverImage,
                carPrice: car.price,
                depositAmount: orderData.depositAmount,
                status: orderData.status,
                payTime: orderData.status !== 'pending' && orderData.status !== 'cancelled' ? new Date() : null,
                closeTime: orderData.status === 'closed' ? new Date() : null,
            },
        })
    }
    console.log(`✅ 创建了 ${ordersToCreate.length} 个演示订单`)

    console.log('🎉 数据初始化完成!')
    console.log('')
    console.log('📝 测试账号:')
    console.log('   管理后台: admin / 123456')
    console.log('   移动端: 任意11位手机号 / 验证码 1234')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
