import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  IsInt,
  MinLength,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { UserStatus } from '../../../entities/auth/user.entity';

// ...existing code...

export class UpdateProfileDto {
  @ApiProperty({ required: false, example: 'Nguyễn' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false, example: 'Văn A' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false, example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: 'Học để đi du học' })
  @IsOptional()
  @IsString()
  motivation?: string;

  @ApiProperty({
    required: false,
    example: 'B1',
    description: 'Trình độ tiếng Anh',
  })
  @IsOptional()
  @IsString()
  englishLevel?: string;

  @ApiProperty({
    required: false,
    example: 'Travel, Food',
    description: 'Chủ đề yêu thích',
  })
  @IsOptional()
  @IsString()
  favouriteTopic?: string;

  @ApiProperty({ required: false, example: 22, description: 'Tuổi' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @ApiProperty({ required: false, example: 'Software Engineer' })
  @IsOptional()
  @IsString()
  job?: string;

  @ApiProperty({ required: false, example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}

export class CreateUserDto {
  @ApiProperty({ example: 'hoangdieu2001' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'hoangdieu@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Passw0rd!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'Danh sách ID roles',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];
}

export class UpdateUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  roleIds?: number[];
}

export class UserPageDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  size?: number = 10;

  @ApiProperty({ required: false })
  @IsOptional()
  keyword?: string;

  @ApiProperty({ enum: UserStatus, required: false })
  @IsOptional()
  status?: UserStatus;
}
