import { Injectable } from '@nestjs/common';
import { BaseAuditRepository } from '../core/repository/base-audit.repository';
import { RoleEntity } from './entities/role.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RolesRepository extends BaseAuditRepository<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    repo: Repository<RoleEntity>,
  ) {
    super(repo);
  }
  async findByRoleName(name: string): Promise<RoleEntity | null> {
    return this.repository.findOne({
      where: { name } as any,
    });
  }

  async findByCreatorId(creatorId: number): Promise<RoleEntity[] | null> {
    return this.repository.find({
      where: { creatorId } as any,
    });
  }
}
