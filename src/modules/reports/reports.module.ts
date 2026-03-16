import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonHistory } from '../../entities/lesson-history.entity';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsRepository } from './reports.repository';

@Module({
  imports: [TypeOrmModule.forFeature([LessonHistory])],
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository],
  exports: [ReportsService],
})
export class ReportsModule {}
