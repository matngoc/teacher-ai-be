import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PageRequestDto } from '../core/dto/page-request.dto';
import { CommonResultDto } from '../core/dto/common-result.dto';
import { RoleEntity } from './entities/role.entity';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('/create')
  async create(
    @Body() createRoleDto: CreateRoleDto,
    @Req() req: any,
  ): Promise<CommonResultDto<RoleEntity>> {
    try {
      const data = await this.rolesService.create(createRoleDto, req);
      return CommonResultDto.success(data, 'Thêm mới vai trò thành công');
    } catch (e) {
      return CommonResultDto.error('Thao tác thất bại', e.message);
    }
  }

  @Post('/get-page')
  findAll(@Body() request: PageRequestDto, @Req() req: any) {
    return this.rolesService.findAll(request, req);
  }

  @Get('/get-by-id/:id')
  findOne(@Param('id') id: number) {
    return this.rolesService.findOne(id);
  }

  @Patch('/update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any,
  ) {
    try {
      const data = await this.rolesService.update(id, updateRoleDto, req);
      return CommonResultDto.success(data, 'Cập nhật vai trò thành công');
    } catch (e) {
      return CommonResultDto.error('Thao tác thất bại', e.message);
    }
  }

  @Delete('/remove/:id')
  async remove(@Param('id') id: number, @Req() req: any) {
    try {
      const data = await this.rolesService.remove(id, req);
      return CommonResultDto.success(data, 'Xóa vai trò thành công');
    } catch (e) {
      return CommonResultDto.error('Thao tác thất bại', e.message);
    }
  }

  @Get('/data-select')
  getDataSelect(@Req() req: any) {
    return this.rolesService.getDataSelect(req);
  }
}
