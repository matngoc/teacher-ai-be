import { AuditEntity } from '../../core/entities/audit.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RoleEntity extends AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'name',
    type: 'nvarchar',
    length: 255,
    nullable: true,
  })
  name: string;

  @Column({
    name: 'description',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  description: string;
}
