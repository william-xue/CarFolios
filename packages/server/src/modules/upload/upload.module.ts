import { Module } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, join } from 'path'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: join(process.cwd(), 'uploads'),
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
                    cb(null, uniqueSuffix + extname(file.originalname))
                },
            }),
            limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
            fileFilter: (req, file, cb) => {
                if (
                    file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/) ||
                    file.mimetype.match(/^video\/(mp4|quicktime|x-msvideo)$/)
                ) {
                    cb(null, true)
                } else {
                    cb(new Error('只支持图片或视频格式'), false)
                }
            },
        }),
    ],
    controllers: [UploadController],
    providers: [UploadService],
})
export class UploadModule { }
