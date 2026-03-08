import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../../entities/lesson.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { UserContextService } from '../../common/context/user-context.service';
import { LessonHistory } from '../../entities/lesson-history.entity';

export enum LearningStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Injectable()
export class LessonRepository extends BaseRepository<Lesson> {
  constructor(
    @InjectRepository(Lesson) repo: Repository<Lesson>,
    userContextService: UserContextService,
  ) {
    super(repo, userContextService);
  }

  async findByCode(code: string): Promise<Lesson | null> {
    return this.repository.findOne({ where: { code, isDeleted: false } });
  }

  async findPageWithFilter(opts: {
    keyword?: string;
    courseId?: number;
    isActive?: boolean;
    userId?: number;
    page?: number;
    size?: number;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const size = Math.min(100, Math.max(1, opts.size ?? 10));

    const qb = this.repository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.course', 'course')
      .where('lesson.isDeleted = :isDeleted', { isDeleted: false });

    if (opts.keyword) {
      qb.andWhere('(lesson.name LIKE :keyword OR lesson.code LIKE :keyword)', {
        keyword: `%${opts.keyword}%`,
      });
    }

    if (opts.courseId) {
      qb.andWhere('lesson.courseId = :courseId', { courseId: opts.courseId });
    }

    if (opts.isActive !== undefined) {
      qb.andWhere('lesson.isActive = :isActive', { isActive: opts.isActive });
    }

    // LEFT JOIN with lesson_histories to get latest progress for the given user
    if (opts.userId) {
      qb.leftJoin(
        (subQb) =>
          subQb
            .select('lh.lesson_id', 'lh_lesson_id')
            .addSelect('MAX(lh.progress_percent)', 'lh_progress')
            .from(LessonHistory, 'lh')
            .where('lh.user_id = :userId', { userId: opts.userId })
            .andWhere('lh.is_deleted = :lhDeleted', { lhDeleted: false })
            .groupBy('lh.lesson_id'),
        'lh_summary',
        'lh_summary.lh_lesson_id = lesson.id',
      ).addSelect(
        `CASE
          WHEN lh_summary.lh_progress IS NULL THEN '${LearningStatus.NOT_STARTED}'
          WHEN lh_summary.lh_progress >= 100 THEN '${LearningStatus.COMPLETED}'
          ELSE '${LearningStatus.IN_PROGRESS}'
        END`,
        'lesson_learningStatus',
      );
    }

    qb.orderBy('lesson.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size);

    if (opts.userId) {
      const rawAndEntities = await qb.getRawAndEntities();
      const total = await qb.getCount();

      const items = rawAndEntities.entities.map((lesson, index) => {
        const raw = rawAndEntities.raw[index];
        return {
          ...lesson,
          learningStatus:
            raw?.lesson_learningStatus ?? LearningStatus.NOT_STARTED,
          progressPercent: raw?.lh_summary_lh_progress
            ? parseFloat(raw.lh_summary_lh_progress)
            : 0,
        };
      });

      return {
        items,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
      };
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }
}
