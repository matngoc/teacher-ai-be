import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseLevel } from '../../entities/course.entity';
import { Lesson } from '../../entities/lesson.entity';
import { LessonHistory } from '../../entities/lesson-history.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { UserContextService } from '../../common/context/user-context.service';

export enum LearningStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
}

@Injectable()
export class CourseRepository extends BaseRepository<Course> {
  constructor(
    @InjectRepository(Course) repo: Repository<Course>,
    userContextService: UserContextService,
  ) {
    super(repo, userContextService);
  }

  async findByCode(code: string): Promise<Course | null> {
    return this.repository.findOne({ where: { code, isDeleted: false } });
  }

  async findPageWithFilter(opts: {
    keyword?: string;
    level?: CourseLevel;
    isActive?: boolean;
    userId?: number;
    page?: number;
    size?: number;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const size = Math.min(100, Math.max(1, opts.size ?? 10));

    const qb = this.repository
      .createQueryBuilder('course')
      .where('course.isDeleted = :isDeleted', { isDeleted: false });

    if (opts.keyword) {
      qb.andWhere('(course.name LIKE :keyword OR course.code LIKE :keyword)', {
        keyword: `%${opts.keyword}%`,
      });
    }

    if (opts.level) {
      qb.andWhere('course.level = :level', { level: opts.level });
    }

    if (opts.isActive !== undefined) {
      qb.andWhere('course.isActive = :isActive', { isActive: opts.isActive });
    }

    qb.orderBy('course.createdAt', 'DESC')
      .skip((page - 1) * size)
      .take(size);

    const [courses, total] = await qb.getManyAndCount();

    // Fetch lessons for each course, with learning status per user
    const courseIds = courses.map((c) => c.id);
    const lessonsMap: Map<number, any[]> = new Map();

    if (courseIds.length > 0) {
      // Fetch all lessons belonging to fetched courses
      const lessons = await this.repository.manager
        .createQueryBuilder(Lesson, 'lesson')
        .where('lesson.courseId IN (:...courseIds)', { courseIds })
        .andWhere('lesson.isDeleted = :lDeleted', { lDeleted: false })
        .orderBy('lesson.createdAt', 'ASC')
        .getMany();

      // If userId provided, fetch latest progress per lesson for that user
      const progressMap: Map<number, number> = new Map();

      if (opts.userId && lessons.length > 0) {
        const lessonIds = lessons.map((l) => l.id);
        const historyRows = await this.repository.manager
          .createQueryBuilder(LessonHistory, 'lh')
          .select('lh.lessonId', 'lessonId')
          .addSelect('MAX(lh.progressPercent)', 'maxProgress')
          .where('lh.userId = :userId', { userId: opts.userId })
          .andWhere('lh.lessonId IN (:...lessonIds)', { lessonIds })
          .andWhere('lh.isDeleted = :lhDeleted', { lhDeleted: false })
          .groupBy('lh.lessonId')
          .getRawMany();

        for (const row of historyRows) {
          progressMap.set(Number(row.lessonId), parseFloat(row.maxProgress));
        }
      }

      // Build lessons with learningStatus and progressPercent
      for (const lesson of lessons) {
        const progressPercent = progressMap.get(lesson.id) ?? 0;
        let learningStatus: LearningStatus;
        if (!opts.userId || !progressMap.has(lesson.id)) {
          learningStatus = LearningStatus.NOT_STARTED;
        } else if (progressPercent >= 100) {
          learningStatus = LearningStatus.COMPLETED;
        } else {
          learningStatus = LearningStatus.IN_PROGRESS;
        }

        const entry = { ...lesson, progressPercent, learningStatus };
        const list = lessonsMap.get(lesson.courseId) ?? [];
        list.push(entry);
        lessonsMap.set(lesson.courseId, list);
      }
    }

    const items = courses.map((course) => ({
      ...course,
      lessons: lessonsMap.get(course.id) ?? [],
    }));

    return {
      items,
      total,
      page,
      size,
      totalPages: Math.ceil(total / size),
    };
  }
}
