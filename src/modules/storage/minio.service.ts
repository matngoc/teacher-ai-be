import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export interface UploadResult {
  objectName: string;
  bucketName: string;
  etag: string;
  size: number;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Client;
  readonly bucketName: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    const port = parseInt(this.config.get<string>('MINIO_PORT', '9000'));
    const useSSL = this.config.get<string>('MINIO_USE_SSL', 'false') === 'true';

    this.bucketName = this.config.get<string>('MINIO_BUCKET', 'uploads');
    this.publicBaseUrl = this.config.get<string>(
      'MINIO_PUBLIC_URL',
      `http://${endpoint}:${port}`,
    );

    this.client = new Client({
      endPoint: endpoint,
      port,
      useSSL,
      accessKey: this.config.get<string>('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: this.config.get<string>('MINIO_SECRET_KEY', 'minioadmin'),
    });
  }

  async onModuleInit() {
    await this.ensureBucket(this.bucketName);
  }

  private async ensureBucket(bucket: string): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        await this.client.makeBucket(bucket, 'us-east-1');
        this.logger.log(`Bucket '${bucket}' đã được tạo`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Lỗi khởi tạo bucket '${bucket}': ${msg}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'files',
  ): Promise<UploadResult> {
    const ext = path.extname(file.originalname);
    const objectName = `${folder}/${uuidv4()}${ext}`;

    const result = await this.client.putObject(
      this.bucketName,
      objectName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return {
      objectName,
      bucketName: this.bucketName,
      etag: result.etag,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    };
  }

  async uploadMultiple(
    files: Express.Multer.File[],
    folder = 'files',
  ): Promise<UploadResult[]> {
    return Promise.all(files.map((f) => this.uploadFile(f, folder)));
  }

  getPublicUrl(objectName: string): string {
    return `${this.publicBaseUrl}/${this.bucketName}/${objectName}`;
  }

  async getPresignedUrl(objectName: string, expiry = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucketName, objectName, expiry);
  }

  async deleteFile(objectName: string): Promise<void> {
    await this.client.removeObject(this.bucketName, objectName);
  }

  async deleteFiles(objectNames: string[]): Promise<void> {
    await this.client.removeObjects(this.bucketName, objectNames);
  }

  async fileExists(objectName: string): Promise<boolean> {
    try {
      await this.client.statObject(this.bucketName, objectName);
      return true;
    } catch {
      return false;
    }
  }
}
