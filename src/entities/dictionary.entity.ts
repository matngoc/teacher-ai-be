import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuditEntity } from './audit.entity';

export enum DictionaryType {
  MOTIVATION = 'MOTIVATION',
  ENGLISH_LEVEL = 'ENGLISH_LEVEL',
  FAVOURITE_TOPIC = 'FAVOURITE_TOPIC',
}

@Entity('dictionaries')
export class Dictionary extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  key: string;

  @Column({ unique: true })
  value: string;

  @Column({
    type: 'enum',
    enum: DictionaryType,
    nullable: true,
  })
  type: DictionaryType;

  @Column({ nullable: true })
  description: string;
}
