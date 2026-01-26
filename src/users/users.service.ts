import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PageRequestDto } from '../core/dto/page-request.dto';
import { UsersRepository } from './users.repository';
import { Like } from 'typeorm';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly userRepo: UsersRepository) {}

  async create(createUserDto: CreateUserDto, req: any): Promise<UserEntity> {
    return this.userRepo.createOne(createUserDto, {
      userId: req.userId || null,
    });
  }

  async findAll(request: PageRequestDto, req: any) {
    const resPerPage = request.size || 10;
    const currentPage = Number(request.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = request.filters?.keyword;

    const filter: any = {
      ...(keyword && {
        email: Like(`%${keyword}%`),
      }),
    };
    return this.userRepo.findAll(
      filter,
      resPerPage,
      skip,
      {},
      {
        relations: [],
      },
    );
  }

  async findOne(id: number) {
    const result = await this.userRepo.findOne(id);
    if (!result) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }
    return result;
  }

  async findByEmail(email: string) {
    return await this.userRepo.findByEmail(email);
  }

  async update(id: number, updateUserDto: UpdateUserDto, req: any) {
    return this.userRepo.updateOne(id, updateUserDto, {
      userId: req.userId || null,
    });
  }
  async updateRefreshToken(userId: string, refreshToken: string) {
    return this.userRepo.updateOne(userId, { refreshToken } as any);
  }

  async remove(id: number, req: any) {
    return this.userRepo.softDelete(id, {
      userId: req.userId || null,
    });
  }
}
