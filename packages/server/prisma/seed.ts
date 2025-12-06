import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// 本地汽车图片（已下载到 uploads/cars/）
const carImages = [
    '/uploads/cars/car-001.jpg',
    '/uploads/cars/car-002.jpg',
    '/uploads/cars/car-003.jpg',
    '/uploads/cars/car-004.jpg',
    '/uploads/cars/car-005.jpg',
    '/uploads/cars/car-006.jpg',
    '/uploads/cars/car-007.jpg',
    '/uploads/cars/car-008.jpg',
    '/uploads/cars/car-009.jpg',
    '/uploads/cars/car-010.jpg',
    '/uploads/cars/car-011.jpg',
    '/uploads/cars/car-012.jpg',
    '/uploads/cars/car-013.jpg',
    '/uploads/cars/car-014.jpg',
    '/uploads/cars/car-015.jpg',
    '/uploads/cars/car-016.jpg',
    '/uploads/cars/car-017.jpg',
    '/uploads/cars/car-018.jpg',
    '/uploads/cars/car-019.jpg',
    '/uploads/cars/car-020.jpg',
    '/uploads/cars/car-021.jpg',
    '/uploads/cars/car-022.jpg',
    '/uploads/cars/car-023.jpg',
    '/uploads/cars/car-024.jpg',
    '/uploads/cars/car-025.jpg',
    '/uploads/cars/car-026.jpg',
    '/uploads/cars/car-027.jpg',
    '/uploads/cars/car-028.jpg',
    '/uploads/cars/car-029.jpg',
    '/uploads/cars/car-030.jpg',
    '/uploads/cars/car-031.jpg',
    '/uploads/cars/car-032.jpg',
    '/uploads/cars/car-033.jpg',
    '/uploads/cars/car-034.jpg',
    '/uploads/cars/car-035.jpg',
    '/uploads/cars/car-036.jpg',
    '/uploads/cars/car-037.jpg',
    '/uploads/cars/car-038.jpg',
    '/uploads/cars/car-039.jpg',
    '/uploads/cars/car-040.jpg',
    '/uploads/cars/car-041.jpg',
    '/uploads/cars/car-042.jpg',
    '/uploads/cars/car-043.jpg',
    '/uploads/cars/car-044.jpg',
    '/uploads/cars/car-045.jpg',
    '/uploads/cars/car-047.jpg',
    '/uploads/cars/car-048.jpg',
    '/uploads/cars/car-049.jpg',
    '/uploads/cars/car-050.jpg',
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

    // 清空数据（注意顺序：先删除有外键依赖的表）
    await prisma.paymentLog.deleteMany({})
    await prisma.payment.deleteMany({})
    await prisma.order.deleteMany({})
    await prisma.archivedCar.deleteMany({})
    await prisma.car.deleteMany({})
    await prisma.series.deleteMany({})

    // 重新创建车系
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

    // 创建演示车源
    const carConfigs = ['全景天窗', '真皮座椅', '座椅加热', '倒车影像', '360全景影像', '定速巡航', '导航系统', 'CarPlay', '无钥匙进入', '一键启动']
    const cities = [
        { code: '110000', name: '北京' },
        { code: '310000', name: '上海' },
        { code: '440100', name: '广州' },
        { code: '440300', name: '深圳' },
        { code: '330100', name: '杭州' },
        { code: '320100', name: '南京' },
        { code: '510100', name: '成都' },
        { code: '500000', name: '重庆' },
        { code: '420100', name: '武汉' },
        { code: '610100', name: '西安' },
        { code: '320500', name: '苏州' },
        { code: '120000', name: '天津' },
        { code: '330200', name: '宁波' },
        { code: '370200', name: '青岛' },
        { code: '210100', name: '沈阳' },
    ]
    const gearboxes = ['AT', 'MT', 'DCT', 'CVT']
    const emissions = ['国五', '国六']
    const colors = ['白色', '黑色', '银色', '蓝色', '红色']

    const carsToCreate = [
        // ========== 已上架车源 (40辆) ==========
        // 宝马系列
        { title: '宝马5系 2021款 530Li 豪华套装', price: 38.8, mileage: 2.5, year: '2021-03', status: 'on' },
        { title: '宝马3系 2022款 325Li M运动套装', price: 28.5, mileage: 1.5, year: '2022-03', status: 'on' },
        { title: '宝马X3 2022款 xDrive30i 领先型', price: 35.8, mileage: 1.8, year: '2022-05', status: 'on' },
        { title: '宝马X5 2021款 xDrive40i 尊享型', price: 62.5, mileage: 2.2, year: '2021-08', status: 'on' },
        { title: '宝马7系 2022款 735Li 豪华套装', price: 78.8, mileage: 1.0, year: '2022-01', status: 'on' },

        // 奔驰系列
        { title: '奔驰E级 2022款 E300L 运动版', price: 42.5, mileage: 1.8, year: '2022-06', status: 'on' },
        { title: '奔驰C级 2021款 C260L 运动版', price: 26.8, mileage: 2.8, year: '2021-05', status: 'on' },
        { title: '奔驰S级 2022款 S400L 商务型', price: 98.8, mileage: 0.8, year: '2022-09', status: 'on' },
        { title: '奔驰GLC 2022款 GLC300L 4MATIC', price: 45.5, mileage: 1.5, year: '2022-07', status: 'on' },
        { title: '奔驰GLE 2021款 GLE450 4MATIC', price: 72.8, mileage: 2.0, year: '2021-11', status: 'on' },

        // 奥迪系列
        { title: '奥迪A6L 2021款 45TFSI 臻选版', price: 35.9, mileage: 3.2, year: '2021-08', status: 'on' },
        { title: '奥迪A4L 2022款 40TFSI 豪华版', price: 28.5, mileage: 1.2, year: '2022-04', status: 'on' },
        { title: '奥迪Q5L 2022款 45TFSI 豪华版', price: 39.8, mileage: 1.0, year: '2022-08', status: 'on' },
        { title: '奥迪Q7 2021款 45TFSI 豪华版', price: 58.8, mileage: 2.5, year: '2021-06', status: 'on' },
        { title: '奥迪A8L 2022款 55TFSI 尊贵型', price: 88.8, mileage: 0.6, year: '2022-02', status: 'on' },

        // 大众系列
        { title: '大众迈腾 2022款 380TSI 旗舰版', price: 22.5, mileage: 1.2, year: '2022-01', status: 'on' },
        { title: '大众帕萨特 2021款 380TSI 豪华版', price: 19.8, mileage: 2.5, year: '2021-09', status: 'on' },
        { title: '大众途观L 2022款 380TSI 四驱旗舰', price: 24.8, mileage: 1.8, year: '2022-03', status: 'on' },
        { title: '大众探岳 2021款 330TSI 豪华版', price: 18.5, mileage: 3.0, year: '2021-07', status: 'on' },

        // 丰田系列
        { title: '丰田凯美瑞 2021款 2.5G 豪华版', price: 18.9, mileage: 3.5, year: '2021-04', status: 'on' },
        { title: '丰田汉兰达 2022款 2.5L 四驱豪华版', price: 32.8, mileage: 1.5, year: '2022-06', status: 'on' },
        { title: '丰田RAV4 2021款 2.0L CVT四驱', price: 19.5, mileage: 2.8, year: '2021-10', status: 'on' },
        { title: '雷克萨斯ES 2022款 300h 卓越版', price: 35.8, mileage: 1.0, year: '2022-05', status: 'on' },

        // 本田系列
        { title: '本田雅阁 2022款 260TURBO 旗舰版', price: 19.8, mileage: 1.5, year: '2022-02', status: 'on' },
        { title: '本田CR-V 2021款 240TURBO CVT四驱', price: 21.5, mileage: 2.2, year: '2021-08', status: 'on' },
        { title: '本田冠道 2022款 370TURBO 四驱尊享', price: 28.8, mileage: 1.0, year: '2022-04', status: 'on' },

        // 特斯拉系列
        { title: '特斯拉Model 3 2022款 Performance高性能版', price: 32.5, mileage: 1.2, year: '2022-07', status: 'on' },
        { title: '特斯拉Model Y 2022款 长续航全轮驱动版', price: 35.8, mileage: 0.8, year: '2022-09', status: 'on' },
        { title: '特斯拉Model S 2021款 长续航版', price: 68.8, mileage: 1.5, year: '2021-12', status: 'on' },

        // 比亚迪系列
        { title: '比亚迪汉 2022款 EV 四驱高性能版', price: 25.8, mileage: 1.0, year: '2022-06', status: 'on' },
        { title: '比亚迪唐 2022款 DM-i 112KM 尊荣型', price: 22.5, mileage: 1.5, year: '2022-03', status: 'on' },
        { title: '比亚迪海豹 2023款 长续航后驱版', price: 21.8, mileage: 0.5, year: '2023-01', status: 'on' },

        // 保时捷系列（高端）
        { title: '保时捷Cayenne 2021款 3.0T', price: 85.8, mileage: 2.0, year: '2021-05', status: 'on' },
        { title: '保时捷Macan 2022款 2.0T', price: 55.8, mileage: 1.2, year: '2022-08', status: 'on' },
        { title: '保时捷911 2021款 Carrera', price: 128.8, mileage: 0.8, year: '2021-10', status: 'on' },

        // 路虎系列
        { title: '路虎揽胜 2022款 3.0T 传世版', price: 135.8, mileage: 0.5, year: '2022-11', status: 'on' },
        { title: '路虎发现 2021款 3.0T 首发限定版', price: 68.8, mileage: 1.8, year: '2021-09', status: 'on' },

        // 沃尔沃系列
        { title: '沃尔沃S90 2022款 B5 智雅豪华版', price: 35.8, mileage: 1.0, year: '2022-04', status: 'on' },
        { title: '沃尔沃XC60 2021款 B5 四驱智雅版', price: 32.5, mileage: 2.0, year: '2021-07', status: 'on' },

        // 凯迪拉克系列
        { title: '凯迪拉克CT6 2022款 28T 铂金版', price: 38.8, mileage: 1.2, year: '2022-05', status: 'on' },
        { title: '凯迪拉克XT5 2021款 28T 四驱铂金版', price: 32.8, mileage: 2.5, year: '2021-08', status: 'on' },

        // ========== 待审核车源 (5辆) ==========
        { title: '宝马X5 2023款 xDrive40Li', price: 68.8, mileage: 0.5, year: '2023-02', status: 'pending' },
        { title: '奔驰GLS 2023款 450 4MATIC', price: 108.8, mileage: 0.3, year: '2023-03', status: 'pending' },
        { title: '保时捷Panamera 2023款 4S', price: 118.8, mileage: 0.2, year: '2023-04', status: 'pending' },
        { title: '特斯拉Model X 2023款 长续航版', price: 88.8, mileage: 0.1, year: '2023-05', status: 'pending' },
        { title: '蔚来ES8 2023款 100kWh 签名版', price: 52.8, mileage: 0.3, year: '2023-02', status: 'pending' },

        // ========== 已下架车源 (3辆) ==========
        { title: '奥迪A4L 2020款 40TFSI 时尚版', price: 23.5, mileage: 4.5, year: '2020-06', status: 'off' },
        { title: '大众CC 2019款 380TSI 魅颜版', price: 18.8, mileage: 5.2, year: '2019-08', status: 'off' },
        { title: '本田思域 2020款 220TURBO CVT燃动版', price: 12.8, mileage: 4.0, year: '2020-03', status: 'off' },

        // ========== 已售出车源 (2辆) ==========
        { title: '宝马7系 2021款 740Li 尊享版', price: 85.0, mileage: 2.0, year: '2021-01', status: 'sold' },
        { title: '奔驰迈巴赫S级 2021款 S480', price: 158.8, mileage: 1.0, year: '2021-06', status: 'sold' },
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

    // 创建过期车辆 (5辆)
    const expiredCarsData = [
        { title: '宝马3系 2019款 320Li 时尚版', price: 22.5, mileage: 5.5, year: '2019-03' },
        { title: '奔驰C级 2018款 C200L 运动版', price: 21.8, mileage: 6.2, year: '2018-08' },
        { title: '奥迪A4L 2019款 35TFSI 进取版', price: 20.5, mileage: 5.8, year: '2019-05' },
        { title: '大众帕萨特 2018款 330TSI 精英版', price: 15.8, mileage: 7.0, year: '2018-11' },
        { title: '丰田凯美瑞 2019款 2.0G 豪华版', price: 16.5, mileage: 6.5, year: '2019-07' },
    ]

    for (let i = 0; i < expiredCarsData.length; i++) {
        const carData = expiredCarsData[i]
        const series = allSeries[i % allSeries.length]
        const owner = allUsers[i % allUsers.length]
        const city = cities[i % cities.length]
        const images = randomImages(5)

        // 设置过期时间为过去的日期
        const expiredDays = 5 + i * 3 // 5天、8天、11天、14天、17天前过期
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() - expiredDays)
        const publishedAt = new Date(expiresAt)
        publishedAt.setDate(publishedAt.getDate() - 30)

        await prisma.car.create({
            data: {
                title: carData.title,
                ownerId: owner.id,
                sourceType: 'personal',
                brandId: series.brandId,
                seriesId: series.id,
                firstRegDate: carData.year,
                mileage: carData.mileage,
                displacement: 2.0,
                gearbox: gearboxes[i % gearboxes.length],
                emissionStandard: emissions[i % emissions.length],
                useType: 'family',
                transferCount: 1,
                cityCode: city.code,
                cityName: city.name,
                price: carData.price,
                originalPrice: carData.price * 1.5,
                status: 'expired',
                coverImage: images[0],
                images: JSON.stringify(images),
                highlightDesc: '车况良好，定期保养，无事故记录。',
                color: colors[i % colors.length],
                plateCity: city.name.slice(0, 1),
                configs: JSON.stringify(carConfigs.slice(0, 5)),
                publishedAt,
                expiresAt,
            },
        })
    }
    console.log(`✅ 创建了 ${expiredCarsData.length} 个过期车辆`)

    // 创建归档车辆 (3辆)
    const archivedCarsData = [
        {
            title: '本田雅阁 2017款 230TURBO 舒适版',
            price: 12.8,
            brandName: '本田',
            seriesName: '雅阁',
            cityName: '广州',
            ownerName: '张先生',
        },
        {
            title: '日产天籁 2018款 2.0L XL 舒适版',
            price: 13.5,
            brandName: '日产',
            seriesName: '天籁',
            cityName: '深圳',
            ownerName: '李女士',
        },
        {
            title: '马自达阿特兹 2017款 2.0L 蓝天豪华版',
            price: 11.8,
            brandName: '马自达',
            seriesName: '阿特兹',
            cityName: '杭州',
            ownerName: '王先生',
        },
    ]

    for (let i = 0; i < archivedCarsData.length; i++) {
        const carData = archivedCarsData[i]
        const archivedAt = new Date()
        archivedAt.setDate(archivedAt.getDate() - (i + 1) * 7) // 7天、14天、21天前归档

        await prisma.archivedCar.create({
            data: {
                originalId: 1000 + i,
                data: JSON.stringify({
                    title: carData.title,
                    price: carData.price,
                    brandName: carData.brandName,
                    seriesName: carData.seriesName,
                    cityName: carData.cityName,
                    ownerName: carData.ownerName,
                    coverImage: carImages[i],
                    mileage: 6.0 + i,
                    expiresAt: new Date(archivedAt.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                }),
                archivedAt,
                archivedBy: 'system',
            },
        })
    }
    console.log(`✅ 创建了 ${archivedCarsData.length} 个归档车辆`)

    // 创建演示订单
    const ordersToCreate = [
        { status: 'pending', depositAmount: 5000 },
        { status: 'paid', depositAmount: 5000 },
        { status: 'paid', depositAmount: 10000 },
        { status: 'closed', depositAmount: 5000 },
        { status: 'closed', depositAmount: 8000 },
        { status: 'cancelled', depositAmount: 5000 },
    ]

    const createdOrders: any[] = []
    for (let i = 0; i < ordersToCreate.length; i++) {
        const orderData = ordersToCreate[i]
        const car = createdCars[i % createdCars.length]
        const buyer = allUsers[(i + 1) % allUsers.length]
        const seller = allUsers[i % allUsers.length]

        const order = await prisma.order.create({
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
        createdOrders.push(order)
    }
    console.log(`✅ 创建了 ${ordersToCreate.length} 个演示订单`)

    // 创建支付记录 (8条)
    const paymentsToCreate = [
        { status: 'pending', channel: 'wechat', amount: 500000 },
        { status: 'pending', channel: 'alipay', amount: 800000 },
        { status: 'paid', channel: 'wechat', amount: 500000 },
        { status: 'paid', channel: 'alipay', amount: 1000000 },
        { status: 'paid', channel: 'wechat', amount: 500000 },
        { status: 'closed', channel: 'wechat', amount: 500000 },
        { status: 'refunded', channel: 'alipay', amount: 800000 },
        { status: 'paid', channel: 'wechat', amount: 1000000 },
    ]

    for (let i = 0; i < paymentsToCreate.length; i++) {
        const paymentData = paymentsToCreate[i]
        const order = createdOrders[i % createdOrders.length]
        const user = allUsers[i % allUsers.length]

        const now = new Date()
        const createdAt = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000) // 1-8天前创建
        const expireTime = new Date(createdAt.getTime() + 30 * 60 * 1000) // 30分钟后过期

        const payment = await prisma.payment.create({
            data: {
                paymentNo: `PAY${Date.now()}${i.toString().padStart(4, '0')}`,
                orderId: order.id,
                userId: user.id,
                channel: paymentData.channel,
                clientType: i % 2 === 0 ? 'h5' : 'app',
                amount: paymentData.amount,
                status: paymentData.status,
                channelTradeNo: paymentData.status === 'paid' || paymentData.status === 'refunded'
                    ? `${paymentData.channel.toUpperCase()}${Date.now()}${i}`
                    : null,
                clientIp: '192.168.1.' + (100 + i),
                expireTime,
                paidAt: paymentData.status === 'paid' || paymentData.status === 'refunded'
                    ? new Date(createdAt.getTime() + 5 * 60 * 1000)
                    : null,
                closedAt: paymentData.status === 'closed' ? expireTime : null,
                refundedAt: paymentData.status === 'refunded'
                    ? new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000)
                    : null,
                refundAmount: paymentData.status === 'refunded' ? paymentData.amount : null,
                refundReason: paymentData.status === 'refunded' ? '用户申请退款' : null,
                createdAt,
            },
        })

        // 创建支付日志
        await prisma.paymentLog.create({
            data: {
                paymentId: payment.id,
                action: 'create',
                status: 'pending',
                clientIp: payment.clientIp,
                createdAt,
            },
        })

        if (paymentData.status === 'paid' || paymentData.status === 'refunded') {
            await prisma.paymentLog.create({
                data: {
                    paymentId: payment.id,
                    action: 'callback',
                    status: 'pending',
                    newStatus: 'paid',
                    responseData: JSON.stringify({ trade_no: payment.channelTradeNo }),
                    createdAt: new Date(createdAt.getTime() + 5 * 60 * 1000),
                },
            })
        }

        if (paymentData.status === 'refunded') {
            await prisma.paymentLog.create({
                data: {
                    paymentId: payment.id,
                    action: 'refund',
                    status: 'paid',
                    newStatus: 'refunded',
                    requestData: JSON.stringify({ amount: paymentData.amount, reason: '用户申请退款' }),
                    createdAt: new Date(createdAt.getTime() + 2 * 24 * 60 * 60 * 1000),
                },
            })
        }
    }
    console.log(`✅ 创建了 ${paymentsToCreate.length} 个支付记录`)

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
