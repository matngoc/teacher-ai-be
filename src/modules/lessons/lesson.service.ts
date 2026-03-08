import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { LessonRepository } from './lesson.repository';
import {
  CreateLessonDto,
  UpdateLessonDto,
  LessonFilterDto,
} from './dto/lesson.dto';
import { UserContextService } from '../../common/context/user-context.service';

@Injectable()
export class LessonService {
  constructor(
    private readonly repo: LessonRepository,
    private readonly userContextService: UserContextService,
  ) {}

  async create(dto: CreateLessonDto) {
    const exists = await this.repo.findByCode(dto.code);
    if (exists) {
      throw new ConflictException(`Mã bài học '${dto.code}' đã tồn tại`);
    }
    return this.repo.create({
      ...dto,
      isActive: dto.isActive ?? true,
    });
  }

  async findPage(dto: LessonFilterDto) {
    // Tự động lấy userId từ context nếu không truyền từ request
    const userId = dto.userId ?? this.userContextService.getUserId();
    return this.repo.findPageWithFilter({
      keyword: dto.keyword,
      courseId: dto.courseId,
      isActive: dto.isActive,
      userId,
      page: dto.page,
      size: dto.size,
    });
  }

  async findByCourse(courseId: number) {
    const userId = this.userContextService.getUserId();
    return this.repo.findPageWithFilter({
      courseId,
      isActive: true,
      userId,
      page: 1,
      size: 1000,
    });
  }

  async findOne(id: number) {
    return this.repo.findByIdOrFail(id);
  }

  async findByCode(code: string) {
    const lesson = await this.repo.findByCode(code);
    if (!lesson)
      throw new NotFoundException(`Không tìm thấy bài học với mã '${code}'`);
    return lesson;
  }

  async update(id: number, dto: UpdateLessonDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: number) {
    await this.repo.softDelete(id);
    return { message: `Đã xóa bài học #${id}` };
  }

  async restore(id: number) {
    return this.repo.restore(id);
  }
}
