import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuditEntity } from './audit.entity';

@Entity('file_uploads')
export class FileUpload extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  // Tên hiển thị
  @Column({ name: 'original_name', length: 255 })
  originalName: string;

  // Tên object trong MinIO
  @Column({ name: 'object_name', length: 255 })
  objectName: string;

  // Bucket name
  @Column({ name: 'bucket_name', length: 100 })
  bucketName: string;

  // MIME type
  @Column({ name: 'mime_type', length: 150 })
  mimeType: string;

  // Kích thước byte
  @Column({ type: 'bigint' })
  size: number;

  // URL public hoặc presigned base URL
  @Column({ name: 'file_url', type: 'text', nullable: true })
  fileUrl: string;

  // ETag từ MinIO (giúp verify integrity)
  @Column({ name: 'etag', nullable: true })
  etag: string;

  // Thư mục logical nếu bạn dùng
  @Column({ nullable: true })
  folder: string;
}
