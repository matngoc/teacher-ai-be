import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class PageRequestDto {
  @ApiProperty({
    description: 'Số trang (bắt đầu từ 1)',
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Số bản ghi mỗi trang',
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  size?: number = 10;

  @ApiProperty({ description: 'Từ khóa tìm kiếm', required: false })
  @IsOptional()
  @IsString()
  keyword?: string;
}
