import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
  Res,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { MinioService } from './minio.service';

@Controller('minio')
@Public()
export class MinioController {
  protected readonly logger = new Logger(MinioController.name);
  constructor(private readonly minioService: MinioService) {}

  @Post('/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB in bytes
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const path = await this.minioService.uploadFile(file, 'images');

    return {
      filePath: path,
      url: this.minioService.getFileUrl(path),
    };
  }

  @Get('/file/:folder/*')
  async getFile(
    @Param('folder') folder: string,
    @Req() request: Request,
    @Res() res: Response,
  ) {
    try {
      // Extract the remaining path after /minio/file/:folder/
      const baseUrl = `/minio/file/${folder}/`;
      const fullPath = request.url;
      const filePath = fullPath.substring(
        fullPath.indexOf(baseUrl) + baseUrl.length,
      );

      this.logger.log(`Fetching file from path: ${folder}/${filePath}`);
      const { stream } = await this.minioService.getFile(
        `${folder}/${filePath}`,
      );

      // Set proper headers for file download
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${filePath}"`);

      stream.pipe(res);
    } catch (error) {
      this.logger.error(`Error fetching file: ${error.message}`);
      throw new BadRequestException('File not found');
    }
  }
}
