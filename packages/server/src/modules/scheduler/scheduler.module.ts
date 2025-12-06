import { Module } from '@nestjs/common'
import { SchedulerService } from './scheduler.service'
import { PrismaModule } from '../../prisma/prisma.module'
import { CarModule } from '../car/car.module'
import { NotificationModule } from '../notification/notification.module'

@Module({
    imports: [PrismaModule, CarModule, NotificationModule],
    providers: [SchedulerService],
    exports: [SchedulerService],
})
export class SchedulerModule { }
