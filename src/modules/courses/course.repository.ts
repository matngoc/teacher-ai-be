import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseLevel } from '../../entities/course.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { UserContextService } from '../../common/context/user-context.service';

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
    page?: number;
    size?: number;
  }) {
    const page = Math.max(1, opts.page ?? 1);
    const size = Math.min(100, Math.max(1, opts.size ?? 10));

    const qb = this.repository
      .createQueryBuilder('course')
      .where('course.is_deleted = :isDeleted', { isDeleted: false });

    if (opts.keyword) {
      qb.andWhere('(course.name LIKE :keyword OR course.code LIKE :keyword)', {
        keyword: `%${opts.keyword}%`,
      });
    }

    if (opts.level) {
      qb.andWhere('course.level = :level', { level: opts.level });
    }

    if (opts.isActive !== undefined) {
      qb.andWhere('course.is_active = :isActive', { isActive: opts.isActive });
    }

    qb.orderBy('course.created_at', 'DESC')
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
}
