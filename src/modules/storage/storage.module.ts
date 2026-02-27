import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { MinioService } from './minio.service';
import { FileUpload } from '../../entities/file-upload.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([FileUpload]),
    MulterModule.register({ storage: memoryStorage() }),
  ],
  controllers: [StorageController],
  providers: [StorageService, MinioService],
  exports: [StorageService, MinioService],
})
export class StorageModule {}

