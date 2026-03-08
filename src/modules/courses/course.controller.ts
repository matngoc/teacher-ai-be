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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseFilterDto,
} from './dto/course.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { CoreConstant } from '../../common/constants/core.constant';
import {
  CurrentUser,
  JwtPayload,
} from '../../common/decorators/current-user.decorator';

@ApiTags('Courses - Khóa học')
@ApiBearerAuth('JWT-auth')
@Controller('courses')
export class CourseController {
  constructor(private readonly service: CourseService) {}

  /**
   * Tạo khóa học mới
   */
  @Post()
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Tạo khóa học mới' })
  async create(@Body() dto: CreateCourseDto) {
    return ApiResponse.created(await this.service.create(dto));
  }

  /**
   * Lấy danh sách khóa học có phân trang và lọc
   */
  @Post('page')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách khóa học (phân trang, lọc)' })
  async findPage(
    @Body() dto: CourseFilterDto,
    @CurrentUser() user: JwtPayload,
  ) {
    dto.userId = user?.userId;
    return ApiResponse.ok(await this.service.findPage(dto));
  }

  /**
   * Lấy tất cả khóa học đang hoạt động (public)
   */
  @Get('active')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Lấy danh sách khóa học đang hoạt động (public)' })
  async findActive(@CurrentUser() user: JwtPayload) {
    return ApiResponse.ok(
      await this.service.findPage({
        isActive: true,
        userId: user?.userId,
        page: 1,
        size: 100,
      }),
    );
  }

  /**
   * Lấy chi tiết khóa học theo mã code
   */
  @Get('code/:code')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Lấy khóa học theo mã code' })
  @ApiParam({ name: 'code', description: 'Mã khóa học', example: 'ENG-001' })
  async findByCode(@Param('code') code: string) {
    return ApiResponse.ok(await this.service.findByCode(code));
  }

  /**
   * Lấy chi tiết khóa học theo ID
   */
  @Get(':id')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Lấy chi tiết khóa học theo ID' })
  @ApiParam({ name: 'id', description: 'ID khóa học' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.findOne(id));
  }

  /**
   * Cập nhật thông tin khóa học
   */
  @Patch(':id')
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Cập nhật thông tin khóa học' })
  @ApiParam({ name: 'id', description: 'ID khóa học' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCourseDto,
  ) {
    return ApiResponse.ok(
      await this.service.update(id, dto),
      'Cập nhật khóa học thành công',
    );
  }

  /**
   * Xóa mềm khóa học
   */
  @Delete(':id')
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Xóa mềm khóa học' })
  @ApiParam({ name: 'id', description: 'ID khóa học' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.remove(id));
  }

  /**
   * Khôi phục khóa học đã xóa mềm
   */
  @Patch(':id/restore')
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Khôi phục khóa học đã xóa' })
  @ApiParam({ name: 'id', description: 'ID khóa học' })
  async restore(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(
      await this.service.restore(id),
      'Khôi phục khóa học thành công',
    );
  }
}
