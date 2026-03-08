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
import { LessonService } from './lesson.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  LessonFilterDto,
} from './dto/lesson.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { CoreConstant } from '../../common/constants/core.constant';

@ApiTags('Lessons - Bài học')
@ApiBearerAuth('JWT-auth')
@Controller('lessons')
export class LessonController {
  constructor(private readonly service: LessonService) {}

  /**
   * Tạo bài học mới
   */
  @Post()
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Tạo bài học mới' })
  async create(@Body() dto: CreateLessonDto) {
    return ApiResponse.created(await this.service.create(dto));
  }

  /**
   * Lấy danh sách bài học có phân trang và lọc
   */
  @Post('page')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách bài học (phân trang, lọc)' })
  async findPage(@Body() dto: LessonFilterDto) {
    return ApiResponse.ok(await this.service.findPage(dto));
  }

  /**
   * Lấy tất cả bài học thuộc khóa học
   */
  @Get('course/:courseId')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Lấy danh sách bài học theo khóa học' })
  @ApiParam({ name: 'courseId', description: 'ID khóa học' })
  async findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return ApiResponse.ok(await this.service.findByCourse(courseId));
  }

  /**
   * Lấy chi tiết bài học theo mã code
   */
  @Get('code/:code')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Lấy bài học theo mã code' })
  @ApiParam({ name: 'code', description: 'Mã bài học', example: 'LESSON-001' })
  async findByCode(@Param('code') code: string) {
    return ApiResponse.ok(await this.service.findByCode(code));
  }

  /**
   * Lấy chi tiết bài học theo ID
   */
  @Get(':id')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Lấy chi tiết bài học theo ID' })
  @ApiParam({ name: 'id', description: 'ID bài học' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.findOne(id));
  }

  /**
   * Cập nhật thông tin bài học
   */
  @Patch(':id')
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Cập nhật thông tin bài học' })
  @ApiParam({ name: 'id', description: 'ID bài học' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonDto,
  ) {
    return ApiResponse.ok(
      await this.service.update(id, dto),
      'Cập nhật bài học thành công',
    );
  }

  /**
   * Xóa mềm bài học
   */
  @Delete(':id')
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Xóa mềm bài học' })
  @ApiParam({ name: 'id', description: 'ID bài học' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.remove(id));
  }

  /**
   * Khôi phục bài học đã xóa mềm
   */
  @Patch(':id/restore')
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Khôi phục bài học đã xóa' })
  @ApiParam({ name: 'id', description: 'ID bài học' })
  async restore(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(
      await this.service.restore(id),
      'Khôi phục bài học thành công',
    );
  }
}
