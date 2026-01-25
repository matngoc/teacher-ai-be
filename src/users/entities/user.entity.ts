import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../core/entities/audit.entity';

@Entity()
export class UserEntity extends AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email: string;

  @Column({
    name: 'description',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  description: string;

  @Column({
    name: 'password',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  password: string;

  @Column()
  roleId: number;

  @Column({
    name: 'refreshToken',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  refreshToken?: string;
}
