import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AuditEntity } from '../../core/entities/audit.entity';

@Entity()
export class UserEntity extends AuditEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    name: 'fullName',
    type: 'nvarchar',
    length: 255,
    nullable: true,
  })
  fullName: string;
  @Column({
    name: 'age',
    type: 'int',
    nullable: true,
  })
  age: string;
  @Column({
    name: 'job',
    type: 'nvarchar',
    length: 255,
    nullable: true,
  })
  job: string;
  @Column({
    name: 'motivation',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  motivation: string;
  @Column({
    name: 'englishLevel',
    type: 'nvarchar',
    length: 255,
    nullable: true,
  })
  englishLevel: string;
  @Column({
    name: 'favouriteTopic',
    type: 'nvarchar',
    length: 500,
    nullable: true,
  })
  favouriteTopic: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: false,
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
