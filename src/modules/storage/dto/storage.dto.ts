import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  objectName: string;

  @ApiProperty()
  fileUrl: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;
}

export class GetPresignedUrlDto {
  @ApiProperty()
  @IsString()
  objectName: string;

  @ApiProperty({ required: false, default: 3600 })
  @IsOptional()
  expiry?: number = 3600;
}

