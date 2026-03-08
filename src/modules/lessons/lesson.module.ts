import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import { LessonRepository } from './lesson.repository';
import { Lesson } from '../../entities/lesson.entity';
import { LessonHistory } from '../../entities/lesson-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonHistory])],
  controllers: [LessonController],
  providers: [LessonService, LessonRepository],
  exports: [LessonService],
})
export class LessonModule {}
