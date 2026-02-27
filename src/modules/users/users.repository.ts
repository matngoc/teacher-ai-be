import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../../entities/auth/user.entity';
import { BaseRepository } from '../../common/repository/base.repository';
import { UserContextService } from '../../common/context/user-context.service';

@Injectable()
export class UsersRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(User) repo: Repository<User>,
    userContextService: UserContextService,
  ) {
    super(repo, userContextService);
  }

  async searchPage(opts: {
    page: number;
    size: number;
    keyword?: string;
    status?: UserStatus;
  }) {
    const qb = this.qb('u')
      .leftJoinAndSelect('u.roles', 'r')
      .leftJoinAndSelect('u.profile', 'p')
      .where('u.is_deleted = :del', { del: false });

    if (opts.keyword) {
      qb.andWhere('(u.username LIKE :kw OR p.email LIKE :kw)', {
        kw: `%${opts.keyword}%`,
      });
    }
    if (opts.status) {
      qb.andWhere('u.status = :status', { status: opts.status });
    }

    const page = Math.max(1, opts.page);
    const size = Math.min(100, Math.max(1, opts.size));
    qb.skip((page - 1) * size)
      .take(size)
      .orderBy('u.id', 'DESC');

    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, size, totalPages: Math.ceil(total / size) };
  }
}
