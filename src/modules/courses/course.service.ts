import { Injectable, ConflictException } from '@nestjs/common';
import { CourseRepository } from './course.repository';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilterDto,
} from './dto/course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly repo: CourseRepository) {}

  async create(dto: CreateCourseDto) {
    const exists = await this.repo.findByCode(dto.code);
    if (exists) {
      throw new ConflictException(`Mã khóa học '${dto.code}' đã tồn tại`);
    }
    return this.repo.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
  }

  async findPage(dto: CourseFilterDto) {
    return this.repo.findPageWithFilter({
      keyword: dto.keyword,
      level: dto.level,
      isActive: dto.isActive,
      page: dto.page,
      size: dto.size,
    });
  }

  async findOne(id: number) {
    return this.repo.findByIdOrFail(id);
  }

  async findByCode(code: string) {
    return this.repo.findByCode(code);
  }

  async update(id: number, dto: UpdateCourseDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: number) {
    await this.repo.softDelete(id);
    return { message: `Đã xóa khóa học #${id}` };
  }

  async restore(id: number) {
    return this.repo.restore(id);
  }
}
