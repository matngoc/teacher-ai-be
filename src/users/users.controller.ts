import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Roles } from '../auth/decorators/public.decorator';
import { PageRequestDto } from '../core/dto/page-request.dto';
import { CommonResultDto } from '../core/dto/common-result.dto';

@Controller('users')
@ApiBearerAuth('JWT-auth')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/create')
  @Roles('sa')
  async create(@Body() createUserDto: CreateUserDto, @Req() req: any) {
    try {
      const data = await this.usersService.create(createUserDto, req);
      return CommonResultDto.success(data, 'Thêm mới người dùng thành công');
    } catch (e) {
      return CommonResultDto.error('Thao tác thất bại', e.message);
    }
  }

  @Roles('sa')
  @Post('/get-page')
  findAll(@Body() request: PageRequestDto, @Req() req: any) {
    return this.usersService.findAll(request, req);
  }

  @Roles('sa')
  @Get('/get-by-id/:id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Roles('sa')
  @Patch('/update/:id')
  async update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    try {
      const data = await this.usersService.update(id, updateUserDto, req);
      return CommonResultDto.success(data, 'Cập nhật người dùng thành công');
    } catch (e) {
      return CommonResultDto.error('Thao tác thất bại', e.message);
    }
  }

  @Roles('sa')
  @Delete('/remove/:id')
  async remove(@Param('id') id: number, @Req() req: any) {
    try {
      const data = await this.usersService.remove(id, req);
      return CommonResultDto.success(data, 'Xóa người dùng thành công');
    } catch (e) {
      return CommonResultDto.error('Thao tác thất bại', e.message);
    }
  }
}
