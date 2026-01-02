import { Repository, FindOptionsWhere } from 'typeorm';
import { Logger } from '@nestjs/common';
import { AuditEntity } from '../schema/audit.entity';

export class BaseAuditRepository<T extends AuditEntity> {
  protected readonly logger = new Logger(BaseAuditRepository.name);

  constructor(protected readonly repository: Repository<T>) {}

  protected getUserId(options?: { userId?: string }): string | null {
    return options?.userId ?? null;
  }

  async createOne(entity: T, options?: { userId?: string }): Promise<T> {
    const userId = this.getUserId(options);

    entity.creationTime = new Date();
    entity.creatorId = userId as any;

    return this.repository.save(entity);
  }

  async updateOne(
    id: number | string,
    entity: T,
    options?: { userId?: string },
  ): Promise<T | null> {
    const userId = this.getUserId(options);

    await this.repository.update(id, {
      ...entity,
      modificationTime: new Date(),
      modifierId: userId,
    } as any);

    return this.repository.findOne({
      where: { id } as any,
    });
  }

  async findOne(
    id: number | string,
    options?: { userId?: string },
  ): Promise<T | null> {
    return this.repository.findOne({
      where: { id } as any,
    });
  }

  async softDelete(
    id: number | string,
    options?: { userId?: string },
  ): Promise<void> {
    const userId = this.getUserId(options);

    await this.repository.update(id, {
      isDeleted: true,
      deletionTime: new Date(),
      deleterId: userId,
    } as any);
  }

  async findAll(
    filter: FindOptionsWhere<T> = {},
    resPerPage = 10,
    skip = 0,
    options?: { userId?: string },
    findOptions?: {
      relations?: string[];
    },
  ): Promise<T[]> {
    const userId = this.getUserId(options);

    const where: FindOptionsWhere<T> = {
      ...filter,
      isDeleted: false,
    };

    if (userId) {
      (where as any).creatorId = userId;
    }

    return this.repository.find({
      where,
      take: resPerPage,
      skip,
      relations: findOptions?.relations,
    });
  }
}
