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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateProfileDto,
  UserPageDto,
} from './dto/user.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Tạo người dùng mới' })
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return ApiResponse.created(data);
  }

  @Post('page')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách người dùng (phân trang)' })
  async findPage(@Body() dto: UserPageDto) {
    const data = await this.usersService.findPage(dto);
    return ApiResponse.ok(data);
  }

  @Get(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Lấy chi tiết người dùng' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usersService.findOne(id);
    return ApiResponse.ok(data);
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Cập nhật người dùng' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    const data = await this.usersService.update(id, dto);
    return ApiResponse.ok(data, 'Cập nhật thành công');
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Xóa mềm người dùng' })
  remove(@Param('id', ParseIntPipe) id: number) {
    const data = this.usersService.remove(id);
    return ApiResponse.ok(data);
  }

  @Patch(':id/restore')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Khôi phục người dùng đã xóa' })
  async restore(@Param('id', ParseIntPipe) id: number) {
    const data = await this.usersService.restore(id);
    return ApiResponse.ok(data, 'Khôi phục thành công');
  }

  // ─── PROFILE ─────────────────────────────────────────────────────────────

  @Patch('profile/me')
  @ApiOperation({
    summary: 'Cập nhật profile của bản thân',
    description:
      'User tự cập nhật thông tin cá nhân: tên, email, tuổi, nghề nghiệp, trình độ tiếng Anh,...',
  })
  async updateMyProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(user.userId, dto);
    return ApiResponse.ok(data, 'Cập nhật profile thành công');
  }

  @Patch(':id/profile')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({
    summary: 'Admin cập nhật profile người dùng theo ID',
  })
  async updateProfileById(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfileDto,
  ) {
    const data = await this.usersService.updateProfile(id, dto);
    return ApiResponse.ok(data, 'Cập nhật profile thành công');
  }
}
