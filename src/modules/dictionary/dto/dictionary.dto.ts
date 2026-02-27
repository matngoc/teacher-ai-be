import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DictionaryType } from '../../../entities/dictionary.entity';

export class CreateDictionaryDto {
  @ApiProperty({ example: 'motivation_study' })
  @IsString()
  key: string;

  @ApiProperty({ example: 'Học để đi làm' })
  @IsString()
  value: string;

  @ApiProperty({ enum: DictionaryType, required: false })
  @IsOptional()
  @IsEnum(DictionaryType)
  type?: DictionaryType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateDictionaryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
