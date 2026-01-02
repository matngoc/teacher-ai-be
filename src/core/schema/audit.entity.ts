import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Column,
} from 'typeorm';

export abstract class AuditEntity {
  @CreateDateColumn({
    name: 'creation_time',
    type: 'datetime',
    nullable: true,
  })
  creationTime?: Date;

  @Column({
    name: 'creator_id',
    nullable: true,
    update: false,
  })
  creatorId?: number;

  @UpdateDateColumn({
    name: 'modification_time',
    type: 'datetime',
    nullable: true,
  })
  modificationTime?: Date;

  @Column({
    name: 'modifier_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  modifierId?: string;

  @Column({
    name: 'is_deleted',
    type: 'boolean',
    default: false,
  })
  isDeleted?: boolean;

  @DeleteDateColumn({
    name: 'deletion_time',
    type: 'datetime',
    nullable: true,
  })
  deletionTime?: Date;

  @Column({
    name: 'deleter_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  deleterId?: string;
}
