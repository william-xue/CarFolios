import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { UserModule } from './modules/user/user.module'
import { CarModule } from './modules/car/car.module'
import { OrderModule } from './modules/order/order.module'
import { UploadModule } from './modules/upload/upload.module'
import { BrandModule } from './modules/brand/brand.module'

@Module({
    imports: [
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
    ],
})
export class AppModule { }
