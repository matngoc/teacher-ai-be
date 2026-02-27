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
import { DictionaryService } from './dictionary.service';
import { CreateDictionaryDto, UpdateDictionaryDto } from './dto/dictionary.dto';
import { Roles, Public } from '../../common/decorators/auth.decorator';
import { ApiResponse } from '../../common/dto/api-response.dto';
import { PageRequestDto } from '../../common/dto/page-request.dto';
import { DictionaryType } from '../../entities/dictionary.entity';

@ApiTags('Dictionary')
@ApiBearerAuth('JWT-auth')
@Controller('dictionaries')
export class DictionaryController {
  constructor(private readonly service: DictionaryService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Tạo mục từ điển mới' })
  async create(@Body() dto: CreateDictionaryDto) {
    return ApiResponse.created(await this.service.create(dto));
  }

  @Post('page')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Danh sách từ điển (phân trang)' })
  async findPage(@Body() dto: PageRequestDto) {
    return ApiResponse.ok(await this.service.findPage(dto));
  }

  @Public()
  @Get('by-type/:type')
  @ApiOperation({ summary: 'Lấy theo type (public)' })
  async findByType(@Param('type') type: DictionaryType) {
    return ApiResponse.ok(await this.service.findByType(type));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.findOne(id));
  }

  @Patch(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Cập nhật' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDictionaryDto,
  ) {
    return ApiResponse.ok(
      await this.service.update(id, dto),
      'Cập nhật thành công',
    );
  }

  @Delete(':id')
  @Roles('ADMIN', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Xóa mềm' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return ApiResponse.ok(await this.service.remove(id));
  }
}
