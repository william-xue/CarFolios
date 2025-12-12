import { Controller, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser, JwtPayload } from '../../common/decorators/current-user.decorator'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { UploadService } from './upload.service'

@ApiTags('文件上传')
@Controller('upload')
export class UploadController {
    constructor(private uploadService: UploadService) { }

    @Post('file')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    @ApiOperation({ summary: '上传文件' })
    uploadFile(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: JwtPayload) {
        return this.uploadService.saveFile(file, user.sub)
    }

    @Post('image')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FileInterceptor('file'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    @ApiOperation({ summary: '上传单张图片' })
    uploadImage(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: JwtPayload) {
        return this.uploadService.saveFile(file, user.sub)
    }

    @Post('images')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @UseInterceptors(FilesInterceptor('files', 10))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } },
        },
    })
    @ApiOperation({ summary: '上传多张图片' })
    uploadImages(@UploadedFiles() files: Express.Multer.File[], @CurrentUser() user: JwtPayload) {
        return this.uploadService.saveFiles(files, user.sub)
    }
}
