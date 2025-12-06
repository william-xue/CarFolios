import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateCarDto, UpdateCarDto, QueryCarDto, AuditCarDto, LocationQueryDto, ArchivedCarQueryDto } from './dto/car.dto'
import { PaginatedResult } from '../../common/dto/pagination.dto'
import {
    validateVin,
    validatePlateNumber,
    calculateDistance,
    formatCarLocation,
    calculateRemainingDays,
    getExpiryDate
} from '../../utils/validators'

// VIN 检查结果
export interface VinCheckResult {
    isValid: boolean
    isDuplicate: boolean
    existingCar?: any
    isSameOwner?: boolean
    errorMessage?: string
}

// 车牌号检查结果
export interface PlateCheckResult {
    isValid: boolean
    isDuplicate: boolean
    existingCar?: any
    warningMessage?: string
}

@Injectable()
export class CarService {
    constructor(private prisma: PrismaService) { }

    // 校验 VIN 唯一性
    async checkVinUniqueness(vin: string, userId: number): Promise<VinCheckResult> {
        // 格式校验
        const formatResult = validateVin(vin)
        if (!formatResult.isValid) {
            return {
                isValid: false,
                isDuplicate: false,
                errorMessage: formatResult.errorMessage,
            }
        }

        // 唯一性校验
        const upperVin = vin.toUpperCase().trim()
        const existingCar = await this.prisma.car.findUnique({
            where: { vin: upperVin },
            include: {
                brand: { select: { name: true } },
                series: { select: { name: true } },
            },
        })

        if (existingCar) {
            const isSameOwner = existingCar.ownerId === userId
            return {
                isValid: true,
                isDuplicate: true,
                existingCar,
                isSameOwner,
                errorMessage: isSameOwner
                    ? '您已发布过该车辆，请前往编辑'
                    : '该车辆已被其他用户发布，如您是车主可申诉认领',
            }
        }

        return { isValid: true, isDuplicate: false }
    }

    // 校验车牌号
    async checkPlateNumber(plateNumber: string): Promise<PlateCheckResult> {
        // 格式校验
        const formatResult = validatePlateNumber(plateNumber)
        if (!formatResult.isValid) {
            return {
                isValid: false,
                isDuplicate: false,
                warningMessage: formatResult.errorMessage,
            }
        }

        // 唯一性校验（仅检查在售车辆）
        const cleanPlate = plateNumber.replace(/[\s·.]/g, '').toUpperCase()
        const existingCar = await this.prisma.car.findFirst({
            where: {
                plateNumber: cleanPlate,
                status: { in: ['on', 'pending', 'approved'] },
            },
        })

        if (existingCar) {
            return {
                isValid: true,
                isDuplicate: true,
                existingCar,
                warningMessage: '该车牌号已存在，请确认是否继续',
            }
        }

        return { isValid: true, isDuplicate: false }
    }

    // 创建车源
    async create(userId: number, dto: CreateCarDto) {
        // VIN 校验
        if (dto.vin) {
            const vinCheck = await this.checkVinUniqueness(dto.vin, userId)
            if (!vinCheck.isValid) {
                throw new BadRequestException(vinCheck.errorMessage)
            }
            if (vinCheck.isDuplicate) {
                throw new BadRequestException({
                    code: vinCheck.isSameOwner ? 'VIN_DUPLICATE_SELF' : 'VIN_DUPLICATE_OTHER',
                    message: vinCheck.errorMessage,
                    existingCarId: vinCheck.existingCar?.id,
                })
            }
        }

        // 车牌号校验（仅格式校验，重复不阻止）
        if (dto.plateNumber) {
            const plateCheck = await this.checkPlateNumber(dto.plateNumber)
            if (!plateCheck.isValid) {
                throw new BadRequestException(plateCheck.warningMessage)
            }
        }

        // 自动生成标题
        let title = dto.title
        if (!title) {
            const brand = await this.prisma.brand.findUnique({ where: { id: dto.brandId } })
            const series = await this.prisma.series.findUnique({ where: { id: dto.seriesId } })
            const year = dto.firstRegDate?.split('-')[0] || new Date().getFullYear()
            title = `${brand?.name || ''} ${series?.name || ''} ${year}款`
        }

        // 设置发布时间和过期时间
        const now = new Date()
        const expiresAt = getExpiryDate(now)

        return this.prisma.car.create({
            data: {
                ...dto,
                title,
                ownerId: userId,
                coverImage: dto.images?.[0] || null,
                images: dto.images ? JSON.stringify(dto.images) : null,
                configs: dto.configs ? JSON.stringify(dto.configs) : null,
                vin: dto.vin?.toUpperCase().trim() || null,
                plateNumber: dto.plateNumber?.replace(/[\s·.]/g, '').toUpperCase() || null,
                status: 'pending',
                publishedAt: now,
                expiresAt,
            },
        })
    }

    // 获取车源列表（支持位置筛选）
    async findAll(query: QueryCarDto & LocationQueryDto) {
        const {
            page = 1,
            pageSize = 10,
            keyword,
            brandId,
            status,
            sourceType,
            provinceId,
            cityId,
            districtId,
        } = query

        const where: any = {}

        if (keyword) {
            where.title = { contains: keyword }
        }
        if (brandId) {
            where.brandId = brandId
        }
        if (status) {
            where.status = status
        }
        if (sourceType) {
            where.sourceType = sourceType
        }
        // 位置筛选
        if (provinceId) {
            where.provinceId = provinceId
        }
        if (cityId) {
            where.cityId = cityId
        }
        if (districtId) {
            where.districtId = districtId
        }

        const [list, total] = await Promise.all([
            this.prisma.car.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    brand: { select: { id: true, name: true } },
                    series: { select: { id: true, name: true } },
                    owner: { select: { id: true, nickname: true, mobile: true } },
                },
            }),
            this.prisma.car.count({ where }),
        ])

        // 解析 JSON 字段并添加额外信息
        const parsedList = list.map((car) => ({
            ...car,
            images: car.images ? JSON.parse(car.images) : [],
            configs: car.configs ? JSON.parse(car.configs) : [],
            locationDisplay: formatCarLocation(car.cityName, car.districtName),
            remainingDays: calculateRemainingDays(car.expiresAt),
            // 添加扁平化的品牌/车系/车主名称
            brandName: car.brand?.name,
            seriesName: car.series?.name,
            ownerName: car.owner?.nickname,
        }))

        return new PaginatedResult(parsedList, total, page, pageSize)
    }

    // 获取上架车源列表（排除过期车辆）
    async findOnSale(query: QueryCarDto & LocationQueryDto) {
        const now = new Date()
        const baseQuery = { ...query, status: 'on' }

        // 获取基础结果
        const result = await this.findAll(baseQuery)

        // 过滤掉已过期的车辆
        result.list = result.list.filter((car: any) => {
            if (!car.expiresAt) return true
            return new Date(car.expiresAt) > now
        })

        return result
    }

    // 按距离筛选车辆
    async findByDistance(lat: number, lng: number, radius: number, query: QueryCarDto) {
        const result = await this.findOnSale(query)

        // 计算距离并筛选
        const carsWithDistance = result.list
            .filter((car: any) => car.lat && car.lng)
            .map((car: any) => ({
                ...car,
                distance: calculateDistance(lat, lng, car.lat, car.lng),
            }))
            .filter((car: any) => car.distance <= radius)
            .sort((a: any, b: any) => a.distance - b.distance)

        return {
            ...result,
            list: carsWithDistance,
            total: carsWithDistance.length,
        }
    }

    // 获取待审核车源列表
    async findPending(query: QueryCarDto) {
        return this.findAll({ ...query, status: 'pending' })
    }

    // 获取车源详情
    async findOne(id: number) {
        const car = await this.prisma.car.findUnique({
            where: { id },
            include: {
                brand: true,
                series: true,
                owner: { select: { id: true, nickname: true, mobile: true, avatar: true } },
            },
        })

        if (!car) throw new NotFoundException('车源不存在')

        return {
            ...car,
            images: car.images ? JSON.parse(car.images) : [],
            configs: car.configs ? JSON.parse(car.configs) : [],
            locationDisplay: formatCarLocation(car.cityName, car.districtName),
            remainingDays: calculateRemainingDays(car.expiresAt),
        }
    }

    // 更新车源
    async update(id: number, userId: number, dto: UpdateCarDto, isAdmin = false) {
        const car = await this.prisma.car.findUnique({ where: { id } })
        if (!car) throw new NotFoundException('车源不存在')

        if (!isAdmin && car.ownerId !== userId) {
            throw new ForbiddenException('无权操作此车源')
        }

        // VIN 校验（如果更新了 VIN）
        if (dto.vin && dto.vin !== car.vin) {
            const vinCheck = await this.checkVinUniqueness(dto.vin, userId)
            if (!vinCheck.isValid) {
                throw new BadRequestException(vinCheck.errorMessage)
            }
            if (vinCheck.isDuplicate) {
                throw new BadRequestException(vinCheck.errorMessage)
            }
        }

        return this.prisma.car.update({
            where: { id },
            data: {
                ...dto,
                images: dto.images ? JSON.stringify(dto.images) : undefined,
                configs: dto.configs ? JSON.stringify(dto.configs) : undefined,
                vin: dto.vin?.toUpperCase().trim() || undefined,
                plateNumber: dto.plateNumber?.replace(/[\s·.]/g, '').toUpperCase() || undefined,
            },
        })
    }

    // 续期车辆
    async renewCar(carId: number, userId: number) {
        const car = await this.prisma.car.findUnique({ where: { id: carId } })
        if (!car) throw new NotFoundException('车源不存在')
        if (car.ownerId !== userId) throw new ForbiddenException('无权操作此车源')

        const now = new Date()
        const newExpiresAt = getExpiryDate(now)

        return this.prisma.car.update({
            where: { id: carId },
            data: {
                expiresAt: newExpiresAt,
                renewedAt: now,
                renewalCount: { increment: 1 },
                status: car.status === 'expired' ? 'on' : car.status,
            },
        })
    }

    // 标记已售
    async markAsSold(carId: number, userId: number) {
        const car = await this.prisma.car.findUnique({ where: { id: carId } })
        if (!car) throw new NotFoundException('车源不存在')
        if (car.ownerId !== userId) throw new ForbiddenException('无权操作此车源')

        return this.prisma.car.update({
            where: { id: carId },
            data: {
                status: 'sold',
                soldAt: new Date(),
            },
        })
    }

    // 下架车辆（保留有效期）
    async takeOffline(carId: number, userId: number) {
        const car = await this.prisma.car.findUnique({ where: { id: carId } })
        if (!car) throw new NotFoundException('车源不存在')
        if (car.ownerId !== userId) throw new ForbiddenException('无权操作此车源')

        return this.prisma.car.update({
            where: { id: carId },
            data: { status: 'off' },
        })
    }

    // 重新上架（过期车辆）
    async reactivateCar(carId: number, userId: number) {
        const car = await this.prisma.car.findUnique({ where: { id: carId } })
        if (!car) throw new NotFoundException('车源不存在')
        if (car.ownerId !== userId) throw new ForbiddenException('无权操作此车源')

        const now = new Date()
        const newExpiresAt = getExpiryDate(now)

        return this.prisma.car.update({
            where: { id: carId },
            data: {
                status: 'on',
                expiresAt: newExpiresAt,
                publishedAt: now,
            },
        })
    }

    // 审核车源
    async audit(id: number, dto: AuditCarDto) {
        const car = await this.prisma.car.findUnique({ where: { id } })
        if (!car) throw new NotFoundException('车源不存在')

        const newStatus = dto.status === 'approved' ? 'on' : 'rejected'
        const now = new Date()

        return this.prisma.car.update({
            where: { id },
            data: {
                status: newStatus,
                rejectReason: dto.status === 'rejected' ? dto.reason : null,
                publishedAt: dto.status === 'approved' ? now : car.publishedAt,
                expiresAt: dto.status === 'approved' ? getExpiryDate(now) : car.expiresAt,
            },
        })
    }

    // 上架/下架
    async toggleStatus(id: number, status: 'on' | 'off') {
        const car = await this.prisma.car.findUnique({ where: { id } })
        if (!car) throw new NotFoundException('车源不存在')

        return this.prisma.car.update({
            where: { id },
            data: { status },
        })
    }

    // 删除车源
    async remove(id: number, userId: number, isAdmin = false) {
        const car = await this.prisma.car.findUnique({ where: { id } })
        if (!car) throw new NotFoundException('车源不存在')

        if (!isAdmin && car.ownerId !== userId) {
            throw new ForbiddenException('无权操作此车源')
        }

        return this.prisma.car.delete({ where: { id } })
    }

    // 获取用户的车源（包括过期的）
    async findByUser(userId: number, query: QueryCarDto) {
        const { page = 1, pageSize = 10, status } = query

        const where: any = { ownerId: userId }
        if (status) {
            where.status = status
        }

        const [list, total] = await Promise.all([
            this.prisma.car.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' },
                include: {
                    brand: { select: { id: true, name: true } },
                    series: { select: { id: true, name: true } },
                },
            }),
            this.prisma.car.count({ where }),
        ])

        const parsedList = list.map((car) => ({
            ...car,
            images: car.images ? JSON.parse(car.images) : [],
            configs: car.configs ? JSON.parse(car.configs) : [],
            locationDisplay: formatCarLocation(car.cityName, car.districtName),
            remainingDays: calculateRemainingDays(car.expiresAt),
        }))

        return new PaginatedResult(parsedList, total, page, pageSize)
    }

    // 获取即将过期的车辆
    async getExpiringCars(daysUntilExpiry: number) {
        const now = new Date()
        const targetDate = new Date()
        targetDate.setDate(targetDate.getDate() + daysUntilExpiry)

        const startOfDay = new Date(targetDate)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(targetDate)
        endOfDay.setHours(23, 59, 59, 999)

        return this.prisma.car.findMany({
            where: {
                status: 'on',
                expiresAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                owner: { select: { id: true, nickname: true, mobile: true } },
            },
        })
    }

    // 获取已过期车辆（用于归档）
    async getExpiredCarsForArchive(expiredDays: number) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - expiredDays)

        return this.prisma.car.findMany({
            where: {
                status: 'expired',
                expiresAt: { lt: cutoffDate },
            },
        })
    }

    // 将过期车辆状态改为 expired
    async markExpiredCars() {
        const now = new Date()

        return this.prisma.car.updateMany({
            where: {
                status: 'on',
                expiresAt: { lt: now },
            },
            data: { status: 'expired' },
        })
    }

    // 归档过期车辆
    async archiveExpiredCars(carIds: number[]) {
        const cars = await this.prisma.car.findMany({
            where: { id: { in: carIds } },
            include: {
                brand: { select: { name: true } },
                series: { select: { name: true } },
                owner: { select: { nickname: true } },
            },
        })

        // 创建归档记录
        for (const car of cars) {
            await this.prisma.archivedCar.create({
                data: {
                    originalId: car.id,
                    data: JSON.stringify({
                        ...car,
                        brandName: car.brand?.name,
                        seriesName: car.series?.name,
                        ownerName: car.owner?.nickname,
                    }),
                    archivedBy: 'system',
                },
            })
        }

        // 删除原记录
        await this.prisma.car.deleteMany({
            where: { id: { in: carIds } },
        })

        return cars.length
    }

    // 管理员续期车辆
    async renewCarByAdmin(carId: number, userId: number, isAdmin: boolean) {
        const car = await this.prisma.car.findUnique({ where: { id: carId } })
        if (!car) throw new NotFoundException('车源不存在')

        // 管理员可以续期任何车辆，普通用户只能续期自己的
        if (!isAdmin && car.ownerId !== userId) {
            throw new ForbiddenException('无权操作此车源')
        }

        const now = new Date()
        const newExpiresAt = getExpiryDate(now)

        return this.prisma.car.update({
            where: { id: carId },
            data: {
                expiresAt: newExpiresAt,
                renewedAt: now,
                renewalCount: { increment: 1 },
                status: car.status === 'expired' ? 'on' : car.status,
            },
        })
    }

    // 获取归档车辆列表
    async getArchivedCars(query: { page?: number; pageSize?: number; keyword?: string }) {
        const { page = 1, pageSize = 10, keyword } = query

        const where: any = {}
        // 如果有关键词，可以在 data JSON 中搜索（简化处理）

        const [list, total] = await Promise.all([
            this.prisma.archivedCar.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { archivedAt: 'desc' },
            }),
            this.prisma.archivedCar.count({ where }),
        ])

        // 解析 JSON 数据
        const parsedList = list.map((item) => ({
            id: item.id,
            originalId: item.originalId,
            data: JSON.parse(item.data as string),
            archivedAt: item.archivedAt,
            archivedBy: item.archivedBy,
        }))

        return {
            list: parsedList,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        }
    }

    // 恢复归档车辆
    async restoreArchivedCar(archivedId: number) {
        const archived = await this.prisma.archivedCar.findUnique({
            where: { id: archivedId },
        })

        if (!archived) {
            throw new NotFoundException('归档记录不存在')
        }

        const carData = JSON.parse(archived.data as string)
        const now = new Date()
        const newExpiresAt = getExpiryDate(now)

        // 移除不需要的字段
        const { id, brand, series, owner, brandName, seriesName, ownerName, createdAt, updatedAt, ...restData } = carData

        // 创建新的车辆记录
        const newCar = await this.prisma.car.create({
            data: {
                ...restData,
                status: 'on',
                publishedAt: now,
                expiresAt: newExpiresAt,
                renewedAt: now,
                renewalCount: (carData.renewalCount || 0) + 1,
            },
        })

        // 删除归档记录
        await this.prisma.archivedCar.delete({
            where: { id: archivedId },
        })

        return newCar
    }

    // 永久删除归档车辆
    async deleteArchivedCar(archivedId: number) {
        const archived = await this.prisma.archivedCar.findUnique({
            where: { id: archivedId },
        })

        if (!archived) {
            throw new NotFoundException('归档记录不存在')
        }

        await this.prisma.archivedCar.delete({
            where: { id: archivedId },
        })

        return { success: true, message: '删除成功' }
    }
}
