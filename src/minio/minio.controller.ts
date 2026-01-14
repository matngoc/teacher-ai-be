import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/decorators/public.decorator';
import { MinioService } from './minio.service';

@Controller('minio')
@Public()
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    const path = await this.minioService.uploadFile(file, 'images');

    return {
      filePath: path,
      url: this.minioService.getFileUrl(path),
    };
  }
}
