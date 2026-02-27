import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../entities/auth/role.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { UserContextService } from '../../common/context/user-context.service';

@Injectable()
export class RolesRepository extends BaseRepository<Role> {
  constructor(
    @InjectRepository(Role) repo: Repository<Role>,
    userContextService: UserContextService,
  ) {
    super(repo, userContextService);
  }

  async findByName(name: string): Promise<Role | null> {
    return this.repository.findOne({ where: { name, isDeleted: false } });
  }
}
