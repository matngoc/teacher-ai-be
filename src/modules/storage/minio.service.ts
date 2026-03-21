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

  private parseEndpoint(): {
    endPoint: string;
    port: number;
    useSSL: boolean;
  } {
    const endpointUrlRaw = this.config.get<string>('MINIO_ENDPOINT_URL');
    const endpointRaw = this.config.get<string>('MINIO_ENDPOINT', 'localhost');
    const portRaw = this.config.get<string>('MINIO_PORT', '9000');
    const useSSLRaw = this.config.get<string>('MINIO_USE_SSL', 'false');

    // Support both styles: MINIO_ENDPOINT_URL=minio:9000 or http(s)://host:port.
    if (endpointUrlRaw) {
      const withProtocol = /^https?:\/\//i.test(endpointUrlRaw)
        ? endpointUrlRaw
        : `http://${endpointUrlRaw}`;
      const parsed = new URL(withProtocol);
      return {
        endPoint: parsed.hostname,
        port: parsed.port
          ? Number(parsed.port)
          : parsed.protocol === 'https:'
            ? 443
            : 80,
        useSSL: parsed.protocol === 'https:',
      };
    }

    return {
      endPoint: endpointRaw,
      port: Number(portRaw),
      useSSL: useSSLRaw === 'true',
    };
  }

  private async wait(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  constructor(private readonly config: ConfigService) {
    const { endPoint, port, useSSL } = this.parseEndpoint();
    const accessKey =
      this.config.get<string>('MINIO_ACCESS_KEY') ??
      this.config.get<string>('MINIO_ROOT_USER', 'minioadmin');
    const secretKey =
      this.config.get<string>('MINIO_SECRET_KEY') ??
      this.config.get<string>('MINIO_ROOT_PASSWORD', 'minioadmin');

    this.bucketName = this.config.get<string>('MINIO_BUCKET', 'uploads');
    this.publicBaseUrl = this.config.get<string>(
      'MINIO_PUBLIC_URL',
      this.config.get<string>(
        'MINIO_SERVER_URL',
        `${useSSL ? 'https' : 'http'}://${endPoint}:${port}`,
      ),
    );

    this.client = new Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    this.logger.log(
      `MinIO config loaded - endpoint=${endPoint}:${port}, ssl=${useSSL}, bucket=${this.bucketName}`,
    );
  }

  async onModuleInit() {
    await this.ensureBucket(this.bucketName);
  }

  private async ensureBucket(bucket: string): Promise<void> {
    const retries = 10;
    const retryDelayMs = 3000;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket, 'us-east-1');
          this.logger.log(`Bucket '${bucket}' đã được tạo`);
        }
        return;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (attempt === retries) {
          this.logger.error(
            `Lỗi khởi tạo bucket '${bucket}' sau ${retries} lần thử: ${msg}`,
          );
          return;
        }

        this.logger.warn(
          `Không thể kết nối MinIO (lần ${attempt}/${retries}), thử lại sau ${retryDelayMs}ms: ${msg}`,
        );
        await this.wait(retryDelayMs);
      }
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
