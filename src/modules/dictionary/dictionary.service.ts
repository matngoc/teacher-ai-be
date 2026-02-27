import { Injectable, ConflictException } from '@nestjs/common';
import { DictionaryRepository } from './dictionary.repository';
import { DictionaryType } from '../../entities/dictionary.entity';
import { CreateDictionaryDto, UpdateDictionaryDto } from './dto/dictionary.dto';
import { PageRequestDto } from '../../common/dto/page-request.dto';

@Injectable()
export class DictionaryService {
  constructor(private readonly repo: DictionaryRepository) {}

  async create(dto: CreateDictionaryDto) {
    const exists = await this.repo.findByKey(dto.key);
    if (exists) throw new ConflictException(`Key '${dto.key}' đã tồn tại`);
    return this.repo.create(dto);
  }

  async findPage(dto: PageRequestDto) {
    return this.repo.findPage({ page: dto.page, size: dto.size });
  }

  async findByType(type: DictionaryType) {
    return this.repo.findByType(type);
  }

  async findOne(id: number) {
    return this.repo.findByIdOrFail(id);
  }

  async update(id: number, dto: UpdateDictionaryDto) {
    return this.repo.update(id, dto);
  }

  async remove(id: number) {
    await this.repo.softDelete(id);
    return { message: `Đã xóa dictionary #${id}` };
  }
}
