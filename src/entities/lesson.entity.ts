import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AuditEntity } from './audit.entity';
import { Course } from './course.entity';

@Entity('lessons')
export class Lesson extends AuditEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'course_id', type: 'int' })
  courseId: number;

  @ManyToOne(() => Course, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'code', type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ name: 'name', length: 500 })
  name: string;

  @Column({ name: 'description', length: 500, nullable: true })
  description?: string;

  @Column({ name: 'task_chain', type: 'longtext', nullable: true })
  taskChain?: string;

  @Column({ name: 'generation_params', type: 'longtext', nullable: true })
  generationParams?: string;

  @Column({
    name: 'provider_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  providerName?: string;

  @Column({ name: 'system_prompt', type: 'longtext', nullable: true })
  systemPrompt?: string;

  @Column({ name: 'format_output', length: 100, nullable: true })
  formatOutput?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;
}
