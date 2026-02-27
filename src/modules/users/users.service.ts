import {
  Injectable,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { Role } from '../../entities/auth/role.entity';
import { User } from '../../entities/auth/user.entity';
import { UserProfile } from '../../entities/auth/user-profile.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UserPageDto,
} from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(UserProfile)
    private readonly profileRepo: Repository<UserProfile>,
  ) {}

  async create(dto: CreateUserDto) {
    const exists = await this.usersRepo.findOne({ username: dto.username });
    if (exists) throw new ConflictException('Username đã tồn tại');

    const emailExists = await this.profileRepo.findOne({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('Email đã được sử dụng');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    let roles: Role[] = [];
    if (dto.roleIds?.length) {
      roles = await this.roleRepo.findByIds(dto.roleIds);
    }

    const user = await this.usersRepo.create({
      username: dto.username,
      passwordHash,
      roles,
    });

    await this.profileRepo.save(
      this.profileRepo.create({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        user,
      }),
    );

    return this.usersRepo.findByIdOrFail(user.id, {
      relations: ['roles', 'profile'],
    });
  }

  async findPage(dto: UserPageDto) {
    return this.usersRepo.searchPage({
      page: dto.page ?? 1,
      size: dto.size ?? 10,
      keyword: dto.keyword,
      status: dto.status,
    });
  }

  async findOne(id: number) {
    return this.usersRepo.findByIdOrFail(id, {
      relations: ['roles', 'profile'],
    });
  }

  async update(id: number, dto: UpdateUserDto) {
    const user = await this.usersRepo.findByIdOrFail(id, {
      relations: ['profile'],
    });

    if (
      (dto.firstName !== undefined || dto.lastName !== undefined) &&
      user.profile
    ) {
      await this.profileRepo.update(user.profile.id, {
        firstName: dto.firstName ?? user.profile.firstName,
        lastName: dto.lastName ?? user.profile.lastName,
      });
    }

    if (dto.roleIds) {
      user.roles = await this.roleRepo.findByIds(dto.roleIds);
      await this.usersRepo['repository'].save(user);
    }

    return this.usersRepo.update(id, {
      status: dto.status,
    });
  }

  async updateProfile(userId: number, dto: UpdateProfileDto): Promise<User> {
    const user = await this.usersRepo.findByIdOrFail(userId, {
      relations: ['profile'],
    });

    if (user.profile) {
      // Kiểm tra email trùng nếu có thay đổi
      if (dto.email && dto.email !== user.profile.email) {
        const emailExists = await this.profileRepo.findOne({
          where: { email: dto.email },
        });
        if (emailExists) throw new ConflictException('Email đã được sử dụng');
      }

      await this.profileRepo.update(user.profile.id, {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.motivation !== undefined && { motivation: dto.motivation }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.englishLevel !== undefined && {
          englishLevel: dto.englishLevel,
        }),
        ...(dto.favouriteTopic !== undefined && {
          favouriteTopic: dto.favouriteTopic,
        }),
        ...(dto.age !== undefined && { age: dto.age }),
        ...(dto.job !== undefined && { job: dto.job }),
      });
    } else {
      // Tạo profile nếu chưa có
      await this.profileRepo.save(
        this.profileRepo.create({
          email: dto.email ?? '',
          firstName: dto.firstName,
          lastName: dto.lastName,
          motivation: dto.motivation,
          englishLevel: dto.englishLevel,
          favouriteTopic: dto.favouriteTopic,
          age: dto.age,
          job: dto.job,
          avatarUrl: dto.avatarUrl,
          user,
        }),
      );
    }

    return this.usersRepo.findByIdOrFail(userId, {
      relations: ['profile'],
    });
  }

  remove(id: number) {
    return { message: `Đã xóa người dùng #${id}` };
  }

  async restore(id: number) {
    return this.usersRepo.restore(id);
  }
}
