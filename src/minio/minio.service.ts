import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get('MINIO_BUCKET') ?? '';

    this.minioClient = new Client({
      endPoint: this.configService.get('MINIO_ENDPOINT') ?? '',
      port: +this.configService.get('MINIO_PORT'),
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ACCESS_KEY'),
      secretKey: this.configService.get('MINIO_SECRET_KEY'),
    });
  }

  async onModuleInit() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'default',
  ): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;

    await this.minioClient.putObject(
      this.bucketName,
      fileName,
      file.buffer,
      file.size,
      { 'Content-Type': file.mimetype },
    );

    return fileName;
  }

  getFileUrl(objectName: string) {
    const apiUrl = this.configService.get('API_URL') || 'http://localhost:8080';
    return `${apiUrl}/minio/file/${objectName}`;
  }

  async getFile(objectName: string): Promise<{
    stream: NodeJS.ReadableStream;
    metadata: any;
  }> {
    const stream = await this.minioClient.getObject(
      this.bucketName,
      objectName,
    );
    return { stream, metadata: {} };
  }
}
