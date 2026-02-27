import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  AssignPermissionsDto,
} from './dto/role.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { PageRequestDto } from '../../common/dto/page-request.dto';

@ApiTags('Roles & Permissions')
@ApiBearerAuth('JWT-auth')
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  // ─── ROLES ────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Tạo role mới' })
  async createRole(@Body() dto: CreateRoleDto) {
    return ApiResponse.created(await this.rolesService.createRole(dto));
  }

  @Post('page')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách roles (phân trang)' })
  async findPage(@Body() dto: PageRequestDto) {
    return ApiResponse.ok(await this.rolesService.findRolePage(dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết role' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.rolesService.findRoleById(id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật role' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return ApiResponse.ok(
      await this.rolesService.updateRole(id, dto),
      'Cập nhật thành công',
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa role' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.rolesService.removeRole(id));
  }

  @Patch(':id/permissions')
  @ApiOperation({ summary: 'Gán permissions cho role' })
  async assignPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignPermissionsDto,
  ) {
    return ApiResponse.ok(
      await this.rolesService.assignPermissions(id, dto),
      'Gán quyền thành công',
    );
  }

  // ─── PERMISSIONS ──────────────────────────────────────────────────────────

  @Get('permissions/all')
  @ApiOperation({ summary: 'Lấy tất cả permissions' })
  async findAllPermissions() {
    return ApiResponse.ok(await this.rolesService.findAllPermissions());
  }

  @Post('permissions')
  @ApiOperation({ summary: 'Tạo permission mới' })
  async createPermission(@Body() dto: CreatePermissionDto) {
    return ApiResponse.created(await this.rolesService.createPermission(dto));
  }

  @Delete('permissions/:id')
  @ApiOperation({ summary: 'Xóa permission' })
  async removePermission(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.rolesService.removePermission(id));
  }
}
