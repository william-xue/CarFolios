import { Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { PaymentCallbackController } from './payment-callback.controller'
import { PaymentService } from './payment.service'
import { WechatPayService } from './wechat-pay.service'
import { AlipayService } from './alipay.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
    imports: [PrismaModule],
    controllers: [PaymentController, PaymentCallbackController],
    providers: [PaymentService, WechatPayService, AlipayService],
    exports: [PaymentService, WechatPayService, AlipayService],
})
export class PaymentModule { }
