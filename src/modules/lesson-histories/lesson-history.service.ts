import { Injectable, NotFoundException } from '@nestjs/common';
import { LessonHistoryRepository } from './lesson-history.repository';
import {
  CreateLessonHistoryDto,
  UpdateLessonHistoryDto,
  LessonHistoryFilterDto,
} from './dto/lesson-history.dto';

@Injectable()
export class LessonHistoryService {
  constructor(private readonly repo: LessonHistoryRepository) {}

  async create(dto: CreateLessonHistoryDto) {
    return this.repo.create({
      lessonId: dto.lessonId,
      userId: dto.userId,
      startedAt: dto.startedAt ? new Date(dto.startedAt) : new Date(),
      finishedAt: dto.finishedAt ? new Date(dto.finishedAt) : undefined,
      progressPercent: dto.progressPercent ?? 0,
      status: dto.status ?? 'in_progress',
      note: dto.note,
    });
  }

  async findPage(dto: LessonHistoryFilterDto) {
    return this.repo.findPageWithFilter({
      keyword: dto.keyword,
      lessonId: dto.lessonId,
      userId: dto.userId,
      status: dto.status,
      page: dto.page,
      size: dto.size,
    });
  }

  async findByLessonId(lessonId: number) {
    return this.repo.findByLessonId(lessonId);
  }

  async findLatestByUserAndLesson(userId: number, lessonId: number) {
    const history = await this.repo.findLatestByUserAndLesson(userId, lessonId);
    if (!history) {
      throw new NotFoundException(
        `Không tìm thấy lịch sử bài học cho user #${userId} và bài học #${lessonId}`,
      );
    }
    return history;
  }

  async findOne(id: number) {
    return this.repo.findByIdOrFail(id);
  }

  async update(id: number, dto: UpdateLessonHistoryDto) {
    return this.repo.update(id, {
      ...(dto.startedAt !== undefined && {
        startedAt: new Date(dto.startedAt),
      }),
      ...(dto.finishedAt !== undefined && {
        finishedAt: new Date(dto.finishedAt),
      }),
      ...(dto.progressPercent !== undefined && {
        progressPercent: dto.progressPercent,
      }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.note !== undefined && { note: dto.note }),
    });
  }

  async remove(id: number) {
    await this.repo.softDelete(id);
    return { message: `Đã xóa lịch sử bài học #${id}` };
  }

  async restore(id: number) {
    return this.repo.restore(id);
  }
}
