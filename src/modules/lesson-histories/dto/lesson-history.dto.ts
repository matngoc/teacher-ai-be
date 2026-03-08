import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsDateString,
  IsString,
  Min,
  Max,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { PageRequestDto } from '../../../common/dto/page-request.dto';

export class CreateLessonHistoryDto {
  @ApiProperty({ description: 'ID bài học', example: 1 })
  @IsNotEmpty({ message: 'lessonId không được để trống' })
  @IsInt()
  lessonId: number;

  @ApiProperty({ description: 'ID người học', example: 1 })
  @IsNotEmpty({ message: 'userId không được để trống' })
  @IsInt()
  userId: number;

  @ApiProperty({
    description: 'Thời gian bắt đầu bài học',
    required: false,
    example: '2026-03-01T08:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiProperty({
    description: 'Thời gian kết thúc bài học',
    required: false,
    example: '2026-03-01T09:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  finishedAt?: string;

  @ApiProperty({
    description: 'Phần trăm tiến độ hoàn thành (0-100)',
    required: false,
    example: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @ApiProperty({
    description: 'Trạng thái bài học (in_progress, completed, paused)',
    required: false,
    example: 'in_progress',
    default: 'in_progress',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiProperty({ description: 'Ghi chú thêm', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateLessonHistoryDto {
  @ApiProperty({
    description: 'Thời gian bắt đầu bài học',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startedAt?: string;

  @ApiProperty({
    description: 'Thời gian kết thúc bài học',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  finishedAt?: string;

  @ApiProperty({
    description: 'Phần trăm tiến độ hoàn thành (0-100)',
    required: false,
    example: 75,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progressPercent?: number;

  @ApiProperty({
    description: 'Trạng thái bài học (in_progress, completed, paused)',
    required: false,
    example: 'completed',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiProperty({ description: 'Ghi chú thêm', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class LessonHistoryFilterDto extends PageRequestDto {
  @ApiProperty({ description: 'Lọc theo ID bài học', required: false })
  @IsOptional()
  @IsInt()
  lessonId?: number;

  @ApiProperty({ description: 'Lọc theo ID người học', required: false })
  @IsOptional()
  @IsInt()
  userId?: number;

  @ApiProperty({
    description: 'Lọc theo trạng thái',
    required: false,
    example: 'completed',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
