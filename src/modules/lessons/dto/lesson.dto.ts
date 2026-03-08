import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsInt,
  MaxLength,
  Matches,
  Min,
} from 'class-validator';

export class CreateLessonDto {
  @ApiProperty({ description: 'ID khóa học', example: 1 })
  @IsNotEmpty({ message: 'courseId không được để trống' })
  @IsInt()
  courseId: number;

  @ApiProperty({ description: 'Mã bài học (duy nhất)', example: 'LESSON-001' })
  @IsNotEmpty({ message: 'Mã bài học không được để trống' })
  @IsString()
  @MaxLength(100)
  @Matches(/^[A-Za-z0-9\-_]+$/, {
    message: 'Mã bài học chỉ chứa chữ cái, số, dấu gạch ngang và gạch dưới',
  })
  code: string;

  @ApiProperty({ description: 'Tên bài học', example: 'Giới thiệu về AI' })
  @IsNotEmpty({ message: 'Tên bài học không được để trống' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Mô tả bài học', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Chuỗi task (JSON hoặc văn bản dài)',
    required: false,
  })
  @IsOptional()
  @IsString()
  taskChain?: string;

  @ApiProperty({
    description: 'Tham số sinh nội dung (JSON hoặc văn bản dài)',
    required: false,
  })
  @IsOptional()
  @IsString()
  generationParams?: string;

  @ApiProperty({
    description: 'Tên nhà cung cấp AI',
    required: false,
    example: 'openai',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerName?: string;

  @ApiProperty({ description: 'System prompt cho AI', required: false })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiProperty({ description: 'Định dạng đầu ra', required: false })
  @IsOptional()
  @IsString()
  formatOutput?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLessonDto {
  @ApiProperty({ description: 'ID khóa học', required: false })
  @IsOptional()
  @IsInt()
  courseId?: number;

  @ApiProperty({ description: 'Tên bài học', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: 'Mô tả bài học', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Chuỗi task', required: false })
  @IsOptional()
  @IsString()
  taskChain?: string;

  @ApiProperty({ description: 'Tham số sinh nội dung', required: false })
  @IsOptional()
  @IsString()
  generationParams?: string;

  @ApiProperty({ description: 'Tên nhà cung cấp AI', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  providerName?: string;

  @ApiProperty({ description: 'System prompt cho AI', required: false })
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiProperty({ description: 'Định dạng đầu ra', required: false })
  @IsOptional()
  @IsString()
  formatOutput?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class LessonFilterDto {
  @ApiProperty({ description: 'Tìm theo tên hoặc mã bài học', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({ description: 'Lọc theo ID khóa học', required: false })
  @IsOptional()
  @IsInt()
  courseId?: number;

  @ApiProperty({
    description: 'Lọc theo trạng thái hoạt động',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description:
      'ID người dùng để lấy trạng thái học (not_started / in_progress / completed). Nếu không truyền sẽ không có trường learningStatus trong kết quả.',
    required: false,
  })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    required: false,
    default: 1,
  })
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Số bản ghi mỗi trang',
    required: false,
    default: 10,
  })
  @IsOptional()
  @Min(1)
  size?: number;
}
