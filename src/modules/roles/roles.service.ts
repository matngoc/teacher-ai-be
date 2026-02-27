import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RolesRepository } from './roles.repository';
import { Permission } from '../../entities/auth/permission.entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  AssignPermissionsDto,
} from './dto/role.dto';
import { PageRequestDto } from '../../common/dto/page-request.dto';

@Injectable()
export class RolesService {
  constructor(
    private readonly rolesRepo: RolesRepository,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
  ) {}

  // ─── ROLES ────────────────────────────────────────────────────────────────

  async createRole(dto: CreateRoleDto) {
    const exists = await this.rolesRepo.findByName(dto.name);
    if (exists) throw new ConflictException(`Role '${dto.name}' đã tồn tại`);

    let permissions: Permission[] = [];
    if (dto.permissionIds?.length) {
      permissions = await this.permissionRepo.findByIds(dto.permissionIds);
    }

    return this.rolesRepo.create({ ...dto, permissions });
  }

  async findRolePage(dto: PageRequestDto) {
    return this.rolesRepo.findPage({
      page: dto.page,
      size: dto.size,
      relations: ['permissions'],
    });
  }

  async findRoleById(id: number) {
    return this.rolesRepo.findByIdOrFail(id, { relations: ['permissions'] });
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const role = await this.rolesRepo.findByIdOrFail(id);

    if (dto.permissionIds) {
      role.permissions = await this.permissionRepo.findByIds(dto.permissionIds);
      await this.rolesRepo['repository'].save(role);
    }

    return this.rolesRepo.update(id, {
      name: dto.name,
      description: dto.description,
    });
  }

  async removeRole(id: number) {
    const role = await this.rolesRepo.findByIdOrFail(id);
    if (role.isSystem)
      throw new ConflictException('Không thể xóa role hệ thống');
    await this.rolesRepo.softDelete(id);
    return { message: `Đã xóa role #${id}` };
  }

  async assignPermissions(roleId: number, dto: AssignPermissionsDto) {
    const role = await this.rolesRepo['repository'].findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    if (!role) throw new NotFoundException(`Role #${roleId} không tồn tại`);

    role.permissions = await this.permissionRepo.findByIds(dto.permissionIds);
    await this.rolesRepo['repository'].save(role);
    return this.findRoleById(roleId);
  }

  // ─── PERMISSIONS ──────────────────────────────────────────────────────────

  async createPermission(dto: CreatePermissionDto) {
    const exists = await this.permissionRepo.findOne({
      where: { name: dto.name },
    });
    if (exists)
      throw new ConflictException(`Permission '${dto.name}' đã tồn tại`);
    return this.permissionRepo.save(this.permissionRepo.create(dto));
  }

  async findAllPermissions() {
    return this.permissionRepo.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  async removePermission(id: number) {
    const perm = await this.permissionRepo.findOne({ where: { id } });
    if (!perm) throw new NotFoundException(`Permission #${id} không tồn tại`);
    await this.permissionRepo.delete(id);
    return { message: `Đã xóa permission #${id}` };
  }
}
