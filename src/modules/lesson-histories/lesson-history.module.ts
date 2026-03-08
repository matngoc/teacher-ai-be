import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonHistoryController } from './lesson-history.controller';
import { LessonHistoryService } from './lesson-history.service';
import { LessonHistoryRepository } from './lesson-history.repository';
import { LessonHistory } from '../../entities/lesson-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LessonHistory])],
  controllers: [LessonHistoryController],
  providers: [LessonHistoryService, LessonHistoryRepository],
  exports: [LessonHistoryService],
})
export class LessonHistoryModule {}
