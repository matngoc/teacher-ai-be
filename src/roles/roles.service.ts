import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { PageRequestDto } from '../core/dto/page-request.dto';
import { RolesRepository } from './roles.repository';
import { DataSelectDto } from '../core/dto/data-select.dto';
import { Like } from 'typeorm';

@Injectable()
export class RolesService {
  constructor(private readonly roleRepo: RolesRepository) {}

  async create(createRoleDto: CreateRoleDto, req: any): Promise<RoleEntity> {
    return this.roleRepo.createOne(createRoleDto, {
      userId: req.userId || null,
    });
  }

  async findAll(request: PageRequestDto, req: any): Promise<RoleEntity[]> {
    const resPerPage = request.size || 10;
    const currentPage = Number(request.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = request.filters?.keyword;

    const filter: any = {
      ...(keyword && {
        email: Like(`%${keyword}%`),
      }),
    };

    return this.roleRepo.findAll(filter, resPerPage, skip, {
      userId: req.userId || null,
    });
  }

  async findByRoleName(roleName: string) {
    const result = await this.roleRepo.findByRoleName(roleName);
    if (!result) {
      throw new NotFoundException('Không tìm thấy vai trò');
    }
    return result;
  }

  findOne(id: number) {
    return this.roleRepo.findOne(id);
  }

  async update(id: number, updateRoleDto: UpdateRoleDto, req: any) {
    return this.roleRepo.updateOne(id, updateRoleDto, {
      userId: req.userId || null,
    });
  }

  async remove(id: number, req: any) {
    return this.roleRepo.softDelete(id, {
      userId: req.userId || null,
    });
  }

  async getDataSelect(req: any): Promise<DataSelectDto[] | undefined> {
    const roles = await this.roleRepo.findByCreatorId(req.userId);
    return roles?.map((role) => {
      return {
        label: role.name,
        value: role.id,
      };
    });
  }
}
