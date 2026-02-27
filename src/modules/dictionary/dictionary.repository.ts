import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Dictionary } from '../../entities/dictionary.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { UserContextService } from '../../common/context/user-context.service';

@Injectable()
export class DictionaryRepository extends BaseRepository<Dictionary> {
  constructor(
    @InjectRepository(Dictionary) repo: Repository<Dictionary>,
    userContextService: UserContextService,
  ) {
    super(repo, userContextService);
  }

  async findByKey(key: string): Promise<Dictionary | null> {
    return this.repository.findOne({ where: { key, isDeleted: false } });
  }

  async findByType(type: string): Promise<Dictionary[]> {
    return this.repository.find({
      where: { type: type as any, isDeleted: false },
      order: { key: 'ASC' },
    });
  }
}
