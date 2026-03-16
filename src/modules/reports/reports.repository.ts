import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonHistory } from '../../entities/lesson-history.entity';
import { UserSession } from '../../entities/auth/user-session.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { UserContextService } from '../../common/context/user-context.service';

@Injectable()
export class ReportsRepository extends BaseRepository<LessonHistory> {
  constructor(
    @InjectRepository(LessonHistory) repo: Repository<LessonHistory>,
    userContextService: UserContextService,
  ) {
    super(repo, userContextService);
  }

  async getLessonCompletionRate(): Promise<{
    startedUsers: number;
    completedUsers: number;
    completionPercent: number;
  }> {
    const startedUsers = await this.repository
      .createQueryBuilder('lh')
      .select('COUNT(DISTINCT lh.userId)', 'count')
      .andWhere('lh.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('lh.progressPercent = :progressPercent', {
        progressPercent: 50,
      })
      .getRawOne<{ count: string }>();

    const completedUsers = await this.repository
      .createQueryBuilder('lh')
      .select('COUNT(DISTINCT lh.userId)', 'count')
      .andWhere('lh.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('lh.progressPercent = :progressPercent', {
        progressPercent: 100,
      })
      .getRawOne<{ count: string }>();

    const startedCount = Number(startedUsers?.count ?? 0);
    const completedCount = Number(completedUsers?.count ?? 0);
    const completionPercent =
      startedCount > 0
        ? Number(((completedCount / startedCount) * 100).toFixed(2))
        : 0;

    return {
      startedUsers: startedCount,
      completedUsers: completedCount,
      completionPercent,
    };
  }

  async getUsageTimeMetric(): Promise<{
    totalUsageSeconds: number;
    totalSessions: number;
    usageTimeMetric: number;
  }> {
    const usageRow = await this.repository
      .createQueryBuilder('lh')
      .select(
        'COALESCE(SUM(TIMESTAMPDIFF(SECOND, lh.startedAt, lh.finishedAt)), 0)',
        'totalUsageSeconds',
      )
      .where('lh.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('lh.startedAt IS NOT NULL')
      .andWhere('lh.finishedAt IS NOT NULL')
      .andWhere('lh.finishedAt >= lh.startedAt')
      .getRawOne<{ totalUsageSeconds: string }>();

    const sessionRow = await this.repository.manager
      .createQueryBuilder(UserSession, 'us')
      .select('COUNT(us.id)', 'totalSessions')
      .getRawOne<{ totalSessions: string }>();

    const totalUsageSeconds = Number(usageRow?.totalUsageSeconds ?? 0);
    const totalSessions = Number(sessionRow?.totalSessions ?? 0);
    const usageTimeMetric =
      totalSessions > 0
        ? Number((totalUsageSeconds / totalSessions).toFixed(2))
        : 0;

    return {
      totalUsageSeconds,
      totalSessions,
      usageTimeMetric,
    };
  }

  async getSessionFrequency(): Promise<{
    totalSessions: number;
    totalUsers: number;
    sessionFrequency: number;
  }> {
    const row = await this.repository.manager
      .createQueryBuilder(UserSession, 'us')
      .select('COUNT(us.id)', 'totalSessions')
      .addSelect('COUNT(DISTINCT us.user_id)', 'totalUsers')
      .getRawOne<{ totalSessions: string; totalUsers: string }>();

    const totalSessions = Number(row?.totalSessions ?? 0);
    const totalUsers = Number(row?.totalUsers ?? 0);
    const sessionFrequency =
      totalUsers > 0 ? Number((totalSessions / totalUsers).toFixed(2)) : 0;

    return {
      totalSessions,
      totalUsers,
      sessionFrequency,
    };
  }
}
