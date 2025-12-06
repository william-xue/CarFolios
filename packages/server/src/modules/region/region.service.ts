import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { SearchRegionDto } from './dto/region.dto'

@Injectable()
export class RegionService {
    constructor(private prisma: PrismaService) { }

    // 获取所有省份
    async getProvinces() {
        return this.prisma.region.findMany({
            where: { level: 1, status: 1 },
            orderBy: { id: 'asc' },
        })
    }

    // 获取指定省份下的城市
    async getCitiesByProvince(provinceId: number) {
        return this.prisma.region.findMany({
            where: { parentId: provinceId, level: 2, status: 1 },
            orderBy: { id: 'asc' },
        })
    }

    // 获取指定城市下的区县
    async getDistrictsByCity(cityId: number) {
        return this.prisma.region.findMany({
            where: { parentId: cityId, level: 3, status: 1 },
            orderBy: { id: 'asc' },
        })
    }

    // 搜索区域（支持名称和拼音）
    async searchRegions(dto: SearchRegionDto) {
        const { keyword, level } = dto

        const where: any = { status: 1 }

        if (keyword) {
            where.OR = [
                { name: { contains: keyword } },
                { pinyin: { contains: keyword.toLowerCase() } },
            ]
        }

        if (level) {
            where.level = level
        }

        return this.prisma.region.findMany({
            where,
            take: 50,
            orderBy: { id: 'asc' },
        })
    }

    // 根据ID获取区域详情
    async getRegionById(id: number) {
        return this.prisma.region.findUnique({
            where: { id },
        })
    }

    // 获取区域的完整路径（省-市-区）
    async getRegionPath(regionId: number) {
        const region = await this.prisma.region.findUnique({
            where: { id: regionId },
        })

        if (!region) return null

        const path: any[] = [region]
        let currentRegion = region

        while (currentRegion.parentId) {
            const parent = await this.prisma.region.findUnique({
                where: { id: currentRegion.parentId },
            })
            if (parent) {
                path.unshift(parent)
                currentRegion = parent
            } else {
                break
            }
        }

        return path
    }

    // 计算两点之间的距离（Haversine 公式）
    calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
        const R = 6371 // 地球半径（公里）
        const dLat = this.toRad(lat2 - lat1)
        const dLng = this.toRad(lng2 - lng1)
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    private toRad(deg: number): number {
        return deg * (Math.PI / 180)
    }

    // 根据坐标获取最近的区域
    async getNearestRegion(lat: number, lng: number, level: number = 3) {
        const regions = await this.prisma.region.findMany({
            where: { level, status: 1, lat: { not: null }, lng: { not: null } },
        })

        type RegionType = typeof regions[number]
        let nearest: RegionType | null = null
        let minDistance = Infinity

        for (const region of regions) {
            if (region.lat && region.lng) {
                const distance = this.calculateDistance(lat, lng, region.lat, region.lng)
                if (distance < minDistance) {
                    minDistance = distance
                    nearest = region
                }
            }
        }

        return nearest
    }
}
