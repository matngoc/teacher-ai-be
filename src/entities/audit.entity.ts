import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class AuditEntity {
  @ApiProperty({ description: 'Thời gian tạo', required: false })
  @CreateDateColumn({ name: 'created_at', type: 'datetime', nullable: true })
  createdAt?: Date;

  @ApiProperty({ description: 'ID người tạo', required: false })
  @Column({ name: 'creator_id', type: 'int', nullable: true, update: false })
  creatorId?: number;

  @ApiProperty({ description: 'Thời gian cập nhật', required: false })
  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', nullable: true })
  updatedAt?: Date;

  @ApiProperty({ description: 'ID người cập nhật', required: false })
  @Column({ name: 'updater_id', type: 'int', nullable: true })
  updaterId?: number;

  @ApiProperty({ description: 'Đã xóa mềm', required: false })
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted?: boolean;

  @ApiProperty({ description: 'Thời gian xóa', required: false })
  @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
  deletedAt?: Date;

  @ApiProperty({ description: 'ID người xóa', required: false })
  @Column({ name: 'deleter_id', type: 'int', nullable: true })
  deleterId?: number;
}
