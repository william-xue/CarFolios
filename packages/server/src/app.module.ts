import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { CarModule } from './modules/car/car.module'
import { OrderModule } from './modules/order/order.module'
import { UploadModule } from './modules/upload/upload.module'
import { BrandModule } from './modules/brand/brand.module'
import { StatsModule } from './modules/stats/stats.module'
import { PaymentModule } from './modules/payment/payment.module'
import { RegionModule } from './modules/region/region.module'
import { NotificationModule } from './modules/notification/notification.module'
import { SchedulerModule } from './modules/scheduler/scheduler.module'
import { FavoriteModule } from './modules/favorite/favorite.module'
import { CommentModule } from './modules/comment/comment.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env.local', '.env'],
        }),
        ScheduleModule.forRoot(),
        JwtModule.register({
            global: true,
            secret: 'car-trading-secret-key',
            signOptions: { expiresIn: '7d' },
        }),
        PrismaModule,
        AuthModule,
        UserModule,
        CarModule,
        OrderModule,
        UploadModule,
        BrandModule,
        StatsModule,
        PaymentModule,
        RegionModule,
        NotificationModule,
        SchedulerModule,
        FavoriteModule,
        CommentModule,
    ],
})
export class AppModule { }
