import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { join } from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule)

    // 静态文件服务 - 使用 __dirname 确保路径正确
    // __dirname 在运行时指向 dist/src，所以需要向上两级到 packages/server
    const uploadsPath = join(__dirname, '..', '..', 'uploads')
    app.useStaticAssets(uploadsPath, { prefix: '/uploads' })
    console.log(`📁 Static files served from: ${uploadsPath}`)

    // 全局前缀
    app.setGlobalPrefix('api')

    // 跨域
    app.enableCors({
        origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
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
        .setTitle('爱车出海二手车 API')
        .setDescription('爱车出海二手车交易平台接口文档')
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
