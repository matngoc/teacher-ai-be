import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DataSelectDto {
  @ApiProperty()
  @IsString()
  readonly label: string;
  @ApiProperty()
  readonly value: any;
}
