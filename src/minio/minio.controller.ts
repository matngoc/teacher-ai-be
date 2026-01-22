import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
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

  @Get('/file/:folder/*')
  async getFile(
    @Param('folder') folder: string,
    @Param() params: any,
    @Res() res: Response,
  ) {
    try {
      const filePath = `${folder}/${params[0]}`;
      const { stream } = await this.minioService.getFile(filePath);

      // Set proper headers for file download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${params[0]}"`);

      stream.pipe(res);
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }
}
