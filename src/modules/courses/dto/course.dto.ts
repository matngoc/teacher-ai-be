import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { CourseLevel } from '../../../entities/course.entity';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Tên khóa học',
    example: 'English for Beginners',
  })
  @IsNotEmpty({ message: 'Tên khóa học không được để trống' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'Mã khóa học (duy nhất, chỉ chứa chữ, số, dấu gạch ngang)',
    example: 'ENG-001',
  })
  @IsNotEmpty({ message: 'Mã khóa học không được để trống' })
  @IsString()
  @MaxLength(100)
  @Matches(/^[A-Za-z0-9\-_]+$/, {
    message: 'Mã khóa học chỉ chứa chữ cái, số, dấu gạch ngang và gạch dưới',
  })
  code: string;

  @ApiProperty({ description: 'Mô tả khóa học', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: CourseLevel,
    description: 'Cấp độ khóa học',
    required: false,
    example: CourseLevel.BEGINNER,
  })
  @IsOptional()
  @IsEnum(CourseLevel, { message: 'Level không hợp lệ' })
  level?: CourseLevel;

  @ApiProperty({ description: 'URL hình ảnh khóa học', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({
    description: 'Trạng thái hoạt động',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCourseDto {
  @ApiProperty({ description: 'Tên khóa học', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiProperty({ description: 'Mô tả khóa học', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: CourseLevel,
    description: 'Cấp độ khóa học',
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseLevel, { message: 'Level không hợp lệ' })
  level?: CourseLevel;

  @ApiProperty({ description: 'URL hình ảnh khóa học', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiProperty({ description: 'Trạng thái hoạt động', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CourseFilterDto {
  @ApiProperty({
    description: 'Tìm theo tên hoặc mã khóa học',
    required: false,
  })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiProperty({
    enum: CourseLevel,
    description: 'Lọc theo level',
    required: false,
  })
  @IsOptional()
  @IsEnum(CourseLevel)
  level?: CourseLevel;

  @ApiProperty({
    description: 'Lọc theo trạng thái hoạt động',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    required: false,
    default: 1,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Số bản ghi mỗi trang',
    required: false,
    default: 10,
  })
  @IsOptional()
  size?: number;
}
