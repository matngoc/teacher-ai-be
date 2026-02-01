import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get('MINIO_BUCKET') ?? 'uploads';

    // Parse endpoint and port from MINIO_ENDPOINT_URL (format: host:port)
    const endpointUrl =
      this.configService.get('MINIO_ENDPOINT_URL') ?? 'minio:9000';
    const [endpoint, portStr] = endpointUrl.split(':');
    const port = portStr ? +portStr : 9000;

    this.minioClient = new Client({
      endPoint: endpoint,
      port: port,
      useSSL: this.configService.get('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get('MINIO_ROOT_USER') ?? 'minioadmin',
      secretKey:
        this.configService.get('MINIO_ROOT_PASSWORD') ?? 'minioadmin123',
    });
  }

  async onModuleInit() {
    // const exists = await this.minioClient.bucketExists(this.bucketName);
    // if (!exists) {
    //   await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
    // }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder = 'default',
  ): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;

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
    const apiUrl =
      this.configService.get('API_URL') || 'http://localhost:8080/api';
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
