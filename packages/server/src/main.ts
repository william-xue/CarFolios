import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    // 静态文件服务
    app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' })

    // 全局前缀
    app.setGlobalPrefix('api')

    // 跨域
    app.enableCors({
        origin: ['http://localhost:3001', 'http://localhost:3002'],
        credentials: true,
    })

    // 全局验证管道
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        }),
    )

    // Swagger 文档
    const config = new DocumentBuilder()
        .setTitle('车故二手车 API')
        .setDescription('车故二手车交易平台接口文档')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document)

    await app.listen(8000)
    console.log(`🚀 Server running on http://localhost:8000`)
    console.log(`📚 API Docs: http://localhost:8000/api/docs`)
}
bootstrap()
