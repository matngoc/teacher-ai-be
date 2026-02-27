import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Query,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { ApiResponse } from '../../common/dto/api-response.dto';

@ApiTags('Storage')
@ApiBearerAuth('JWT-auth')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload 1 file lên MinIO' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', default: 'files' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadOne(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder = 'files',
  ) {
    if (!file) throw new BadRequestException('Chưa chọn file');
    const data = await this.storageService.upload(file, folder);
    return ApiResponse.created(data, 'Upload thành công');
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Upload nhiều file lên MinIO' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
        folder: { type: 'string', default: 'files' },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('folder') folder = 'files',
  ) {
    if (!files?.length) throw new BadRequestException('Chưa chọn file');
    const data = await this.storageService.uploadMultiple(files, folder);
    return ApiResponse.created(data, `Upload ${data.length} file thành công`);
  }

  @Get(':id/presigned')
  @ApiOperation({ summary: 'Lấy presigned URL để truy cập file' })
  async getPresignedUrl(
    @Param('id', ParseIntPipe) id: number,
    @Query('expiry') expiry = '3600',
  ) {
    const url = await this.storageService.getPresignedUrl(id, +expiry);
    return ApiResponse.ok({ url });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa file' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.storageService.delete(id);
    return ApiResponse.ok(null, 'Đã xóa file');
  }
}
