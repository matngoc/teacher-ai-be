import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AuditEntity } from './audit.entity';
import { Lesson } from './lesson.entity';
import { User } from './auth/user.entity';

@Entity('lesson_histories')
export class LessonHistory extends AuditEntity {
  @ApiProperty({ description: 'ID lịch sử bài học' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ description: 'ID bài học' })
  @Column({ name: 'lesson_id', type: 'int' })
  lessonId: number;

  @ApiProperty({ description: 'Bài học' })
  @ManyToOne(() => Lesson, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ApiProperty({ description: 'ID người học' })
  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ApiProperty({ description: 'Người học' })
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({ description: 'Thời gian bắt đầu bài học', required: false })
  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt?: Date;

  @ApiProperty({ description: 'Thời gian kết thúc bài học', required: false })
  @Column({ name: 'finished_at', type: 'datetime', nullable: true })
  finishedAt?: Date;

  @ApiProperty({
    description: 'Phần trăm tiến độ hoàn thành (0-100)',
    example: 75,
  })
  @Column({
    name: 'progress_percent',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  progressPercent: number;

  @ApiProperty({
    description: 'Trạng thái bài học (in_progress, completed, paused)',
    example: 'in_progress',
    required: false,
  })
  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: 'in_progress',
  })
  status: string;

  @ApiProperty({ description: 'Ghi chú thêm', required: false })
  @Column({ name: 'note', type: 'text', nullable: true })
  note?: string;
}
