import { Injectable } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import {
  LessonCompletionRateResponseDto,
  SessionFrequencyResponseDto,
  UsageTimeMetricResponseDto,
} from './dto/report.dto';

@Injectable()
export class ReportsService {
  constructor(private readonly repo: ReportsRepository) {}

  async getLessonCompletionRate(): Promise<LessonCompletionRateResponseDto> {
    const data = await this.repo.getLessonCompletionRate();

    return {
      startedUsers: data.startedUsers,
      completedUsers: data.completedUsers,
      completionPercent: data.completionPercent,
    };
  }

  async getUsageTimeMetric(): Promise<UsageTimeMetricResponseDto> {
    const data = await this.repo.getUsageTimeMetric();

    return {
      totalUsageSeconds: data.totalUsageSeconds,
      totalSessions: data.totalSessions,
      usageTimeMetric: data.usageTimeMetric,
    };
  }

  async getSessionFrequency(): Promise<SessionFrequencyResponseDto> {
    const data = await this.repo.getSessionFrequency();

    return {
      totalSessions: data.totalSessions,
      totalUsers: data.totalUsers,
      sessionFrequency: data.sessionFrequency,
    };
  }
}
