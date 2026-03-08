import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { Course } from '../../entities/course.entity';
import { Lesson } from '../../entities/lesson.entity';
import { LessonHistory } from '../../entities/lesson-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lesson, LessonHistory])],
  controllers: [CourseController],
  providers: [CourseService, CourseRepository],
  exports: [CourseService],
})
export class CourseModule {}
