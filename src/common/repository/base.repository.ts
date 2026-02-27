import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  DeepPartial,
  FindOneOptions,
  SelectQueryBuilder,
} from 'typeorm';
import { Logger, NotFoundException } from '@nestjs/common';
import { AuditEntity } from '../../entities/audit.entity';
import { UserContextService } from '../context/user-context.service';

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface FindPageOptions<T> {
  filter?: FindOptionsWhere<T>;
  page?: number;
  size?: number;
  relations?: string[];
  order?: FindManyOptions<T>['order'];
}

export abstract class BaseRepository<T extends AuditEntity> {
  protected readonly logger: Logger;

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly userContextService: UserContextService,
  ) {
    this.logger = new Logger(this.constructor.name);
  }

  protected get currentUserId(): number | undefined {
    return this.userContextService.getUserId();
  }

  async create(data: DeepPartial<T>): Promise<T> {
    const entity = this.repository.create({
      ...data,
      creatorId: this.currentUserId,
      isDeleted: false,
    } as DeepPartial<T>);
    return this.repository.save(entity);
  }

  async createMany(items: DeepPartial<T>[]): Promise<T[]> {
    const entities = items.map((d) =>
      this.repository.create({
        ...d,
        creatorId: this.currentUserId,
        isDeleted: false,
      } as DeepPartial<T>),
    );
    return this.repository.save(entities);
  }

  async update(id: number, data: DeepPartial<T>): Promise<T> {
    await this.repository.update(id, {
      ...data,
      updaterId: this.currentUserId,
    } as any);
    const updated = await this.findById(id);
    if (!updated) throw new NotFoundException(`Không tìm thấy bản ghi #${id}`);
    return updated;
  }

  async findById(id: number, options?: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne({
      where: { id, isDeleted: false } as any as FindOptionsWhere<T>,
      ...options,
    });
  }

  async findByIdOrFail(id: number, options?: FindOneOptions<T>): Promise<T> {
    const entity = await this.findById(id, options);
    if (!entity) throw new NotFoundException(`Không tìm thấy bản ghi #${id}`);
    return entity;
  }

  async findOne(
    where: FindOptionsWhere<T>,
    options?: FindOneOptions<T>,
  ): Promise<T | null> {
    return this.repository.findOne({
      where: { ...where, isDeleted: false } as FindOptionsWhere<T>,
      ...options,
    });
  }

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find({
      where: { isDeleted: false } as FindOptionsWhere<T>,
      ...options,
    } as FindManyOptions<T>);
  }

  async findPage(opts: FindPageOptions<T> = {}): Promise<PageResult<T>> {
    const page = Math.max(1, opts.page ?? 1);
    const size = Math.min(100, Math.max(1, opts.size ?? 10));
    const [items, total] = await this.repository.findAndCount({
      where: {
        ...(opts.filter ?? {}),
        isDeleted: false,
      } as FindOptionsWhere<T>,
      take: size,
      skip: (page - 1) * size,
      relations: opts.relations,
      order: opts.order,
    });
    return { items, total, page, size, totalPages: Math.ceil(total / size) };
  }

  async findPageAdmin(opts: FindPageOptions<T> = {}): Promise<PageResult<T>> {
    const page = Math.max(1, opts.page ?? 1);
    const size = Math.min(100, Math.max(1, opts.size ?? 10));
    const [items, total] = await this.repository.findAndCount({
      where: opts.filter,
      take: size,
      skip: (page - 1) * size,
      relations: opts.relations,
      order: opts.order,
    });
    return { items, total, page, size, totalPages: Math.ceil(total / size) };
  }

  async softDelete(id: number): Promise<void> {
    await this.findByIdOrFail(id);
    await this.repository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
      deleterId: this.currentUserId,
    } as any);
  }

  async restore(id: number): Promise<T> {
    const entity = await this.repository.findOne({
      where: { id } as any as FindOptionsWhere<T>,
    });
    if (!entity) throw new NotFoundException(`Không tìm thấy bản ghi #${id}`);
    await this.repository.update(id, {
      isDeleted: false,
      deletedAt: null,
      deleterId: null,
      updaterId: this.currentUserId,
    } as any);
    return this.findByIdOrFail(id);
  }

  async hardDelete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(where: FindOptionsWhere<T>): Promise<boolean> {
    const count = await this.repository.count({
      where: { ...where, isDeleted: false } as FindOptionsWhere<T>,
    });
    return count > 0;
  }

  async count(where: FindOptionsWhere<T> = {}): Promise<number> {
    return this.repository.count({
      where: { ...where, isDeleted: false } as FindOptionsWhere<T>,
    });
  }

  protected qb(alias: string): SelectQueryBuilder<T> {
    return this.repository.createQueryBuilder(alias);
  }
}
