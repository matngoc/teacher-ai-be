import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonHistory } from '../../entities/lesson-history.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { UserContextService } from '../../common/context/user-context.service';

@Injectable()
export class LessonHistoryRepository extends BaseRepository<LessonHistory> {
  constructor(
    @InjectRepository(LessonHistory) repo: Repository<LessonHistory>,
    userContextService: UserContextService,
  ) {
    super(repo, userContextService);
  }

  async findPageWithFilter(opts: {
    keyword?: string;
    lessonId?: number;
    userId?: number;
    status?: string;
    page?: number;
    size?: number;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const size = Math.min(100, Math.max(1, opts.size ?? 10));

    const qb = this.repository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.lesson', 'lesson')
      .leftJoinAndSelect('history.user', 'user')
      .where('history.isDeleted = :isDeleted', { isDeleted: false });

    if (opts.lessonId) {
      qb.andWhere('history.lessonId = :lessonId', {
        lessonId: opts.lessonId,
      });
    }

    if (opts.userId) {
      qb.andWhere('history.userId = :userId', { userId: opts.userId });
    }

    if (opts.status) {
      qb.andWhere('history.status = :status', { status: opts.status });
    }

    if (opts.keyword) {
      qb.andWhere('(lesson.name LIKE :keyword OR lesson.code LIKE :keyword)', {
        keyword: `%${opts.keyword}%`,
      });
    }

    qb.orderBy('history.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }

  async findByLessonId(lessonId: number): Promise<LessonHistory[]> {
    return this.repository.find({
      where: { lessonId, isDeleted: false },
      relations: ['lesson', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findLatestByUserAndLesson(
    userId: number,
    lessonId: number,
  ): Promise<LessonHistory | null> {
    return this.repository.findOne({
      where: { userId, lessonId, isDeleted: false },
      relations: ['lesson', 'user'],
      order: { createdAt: 'DESC' },
    });
  }
}
