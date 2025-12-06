import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { CarService } from '../car/car.service'
import { NotificationService, ExpiryNotification } from '../notification/notification.service'

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name)

    constructor(
        private readonly carService: CarService,
        private readonly notificationService: NotificationService,
    ) { }

    // 每日凌晨 2:00 执行过期检查和提醒
    @Cron('0 2 * * *')
    async processExpiringCars() {
        this.logger.log('开始执行过期车辆检查任务...')

        try {
            // 1. 将已过期车辆状态改为 expired
            const expiredResult = await this.carService.markExpiredCars()
            this.logger.log(`已将 ${expiredResult.count} 辆车标记为过期`)

            // 2. 发送过期提醒通知
            await this.sendExpiryNotifications()

            this.logger.log('过期车辆检查任务完成')
        } catch (error) {
            this.logger.error('过期车辆检查任务失败', error)
        }
    }

    // 发送过期提醒通知
    async sendExpiryNotifications() {
        const notifications: ExpiryNotification[] = []

        // 7天后过期
        const cars7Days = await this.carService.getExpiringCars(7)
        for (const car of cars7Days) {
            notifications.push({
                userId: car.ownerId,
                carId: car.id,
                carTitle: car.title,
                daysUntilExpiry: 7,
                notificationType: 'first',
            })
        }

        // 3天后过期
        const cars3Days = await this.carService.getExpiringCars(3)
        for (const car of cars3Days) {
            notifications.push({
                userId: car.ownerId,
                carId: car.id,
                carTitle: car.title,
                daysUntilExpiry: 3,
                notificationType: 'second',
            })
        }

        // 1天后过期
        const cars1Day = await this.carService.getExpiringCars(1)
        for (const car of cars1Day) {
            notifications.push({
                userId: car.ownerId,
                carId: car.id,
                carTitle: car.title,
                daysUntilExpiry: 1,
                notificationType: 'final',
            })
        }

        if (notifications.length > 0) {
            await this.notificationService.sendBatchExpiryReminders(notifications)
            this.logger.log(`已发送 ${notifications.length} 条过期提醒通知`)
        }
    }

    // 每日凌晨 2:30 执行归档任务
    @Cron('30 2 * * *')
    async archiveOldExpiredCars() {
        this.logger.log('开始执行归档任务...')

        try {
            // 获取过期超过 30 天的车辆
            const carsToArchive = await this.carService.getExpiredCarsForArchive(30)

            if (carsToArchive.length === 0) {
                this.logger.log('没有需要归档的车辆')
                return
            }

            const carIds = carsToArchive.map((car) => car.id)
            const archivedCount = await this.carService.archiveExpiredCars(carIds)

            this.logger.log(`已归档 ${archivedCount} 辆过期车辆`)
        } catch (error) {
            this.logger.error('归档任务失败', error)
        }
    }

    // 手动触发过期检查（用于测试）
    async manualProcessExpiringCars() {
        return this.processExpiringCars()
    }

    // 手动触发归档（用于测试）
    async manualArchiveOldExpiredCars() {
        return this.archiveOldExpiredCars()
    }
}
