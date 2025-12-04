import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class UploadService {
    constructor(private prisma: PrismaService) { }

    async saveFile(file: Express.Multer.File, userId?: number) {
        const record = await this.prisma.upload.create({
            data: {
                filename: file.originalname,
                path: `/uploads/${file.filename}`,
                mimetype: file.mimetype,
                size: file.size,
                userId,
            },
        })

        return {
            id: record.id,
            url: record.path,
            filename: file.originalname,
        }
    }

    async saveFiles(files: Express.Multer.File[], userId?: number) {
        const results = await Promise.all(files.map((file) => this.saveFile(file, userId)))
        return results
    }
}
