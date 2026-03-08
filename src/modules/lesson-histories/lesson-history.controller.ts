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
import { LessonHistoryService } from './lesson-history.service';
import {
  CreateLessonHistoryDto,
  UpdateLessonHistoryDto,
  LessonHistoryFilterDto,
} from './dto/lesson-history.dto';
import { Roles } from '../../common/decorators/auth.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { CoreConstant } from '../../common/constants/core.constant';

@ApiTags('Lesson Histories - Lịch sử bài học')
@ApiBearerAuth('JWT-auth')
@Controller('lesson-histories')
export class LessonHistoryController {
  constructor(private readonly service: LessonHistoryService) {}

  /**
   * Tạo lịch sử bài học mới
   */
  @Post()
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Tạo lịch sử bài học mới' })
  async create(@Body() dto: CreateLessonHistoryDto) {
    return ApiResponse.created(await this.service.create(dto));
  }

  /**
   * Lấy danh sách lịch sử bài học có phân trang và lọc
   */
  @Post('page')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách lịch sử bài học (phân trang, lọc)' })
  async findPage(@Body() dto: LessonHistoryFilterDto) {
    return ApiResponse.ok(await this.service.findPage(dto));
  }

  /**
   * Lấy tất cả lịch sử theo ID bài học
   */
  @Get('lesson/:lessonId')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Lấy lịch sử theo ID bài học' })
  @ApiParam({ name: 'lessonId', description: 'ID bài học' })
  async findByLessonId(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return ApiResponse.ok(await this.service.findByLessonId(lessonId));
  }

  /**
   * Lấy lịch sử gần nhất của người dùng cho bài học
   */
  @Get('lesson/:lessonId/user/:userId')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({
    summary: 'Lấy lịch sử gần nhất của người dùng cho một bài học',
  })
  @ApiParam({ name: 'lessonId', description: 'ID bài học' })
  @ApiParam({ name: 'userId', description: 'ID người học' })
  async findLatestByUserAndLesson(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return ApiResponse.ok(
      await this.service.findLatestByUserAndLesson(userId, lessonId),
    );
  }

  /**
   * Lấy chi tiết lịch sử bài học theo ID
   */
  @Get(':id')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Lấy chi tiết lịch sử bài học theo ID' })
  @ApiParam({ name: 'id', description: 'ID lịch sử bài học' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.findOne(id));
  }

  /**
   * Cập nhật lịch sử bài học
   */
  @Patch(':id')
  @Roles(CoreConstant.Admin, CoreConstant.User)
  @ApiOperation({ summary: 'Cập nhật lịch sử bài học' })
  @ApiParam({ name: 'id', description: 'ID lịch sử bài học' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonHistoryDto,
  ) {
    return ApiResponse.ok(
      await this.service.update(id, dto),
      'Cập nhật lịch sử bài học thành công',
    );
  }

  /**
   * Xóa mềm lịch sử bài học
   */
  @Delete(':id')
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Xóa mềm lịch sử bài học' })
  @ApiParam({ name: 'id', description: 'ID lịch sử bài học' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.remove(id));
  }

  /**
   * Khôi phục lịch sử bài học đã xóa mềm
   */
  @Patch(':id/restore')
  @Roles(CoreConstant.Admin)
  @ApiOperation({ summary: 'Khôi phục lịch sử bài học đã xóa' })
  @ApiParam({ name: 'id', description: 'ID lịch sử bài học' })
  async restore(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(
      await this.service.restore(id),
      'Khôi phục lịch sử bài học thành công',
    );
  }
}
