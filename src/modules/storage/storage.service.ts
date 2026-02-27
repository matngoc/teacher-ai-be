import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinioService } from './minio.service';
import { FileUpload } from '../../entities/file-upload.entity';
import { UserContextService } from '../../common/context/user-context.service';

@Injectable()
export class StorageService {
  constructor(
    private readonly minioService: MinioService,
    @InjectRepository(FileUpload)
    private readonly fileRepo: Repository<FileUpload>,
    private readonly userContext: UserContextService,
  ) {}

  async upload(
    file: Express.Multer.File,
    folder = 'files',
  ): Promise<FileUpload> {
    const result = await this.minioService.uploadFile(file, folder);
    const fileUrl = this.minioService.getPublicUrl(result.objectName);

    return this.fileRepo.save(
      this.fileRepo.create({
        originalName: result.originalName,
        objectName: result.objectName,
        bucketName: result.bucketName,
        mimeType: result.mimeType,
        size: result.size,
        fileUrl,
        etag: result.etag,
        folder,
        creatorId: this.userContext.getUserId(),
        isDeleted: false,
      }),
    );
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder = 'files',
  ): Promise<FileUpload[]> {
    return Promise.all(files.map((f) => this.upload(f, folder)));
  }

  async findById(id: number): Promise<FileUpload> {
    const file = await this.fileRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!file) throw new NotFoundException(`File #${id} không tồn tại`);
    return file;
  }

  async getPresignedUrl(id: number, expiry = 3600): Promise<string> {
    const file = await this.findById(id);
    return this.minioService.getPresignedUrl(file.objectName, expiry);
  }

  async delete(id: number): Promise<void> {
    const file = await this.findById(id);
    await this.minioService.deleteFile(file.objectName);
    await this.fileRepo.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deleterId: this.userContext.getUserId(),
    });
  }
}
