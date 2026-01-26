import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  fullName: string;
  @ApiProperty()
  age: string;
  @ApiProperty()
  job: string;
  @ApiProperty()
  motivation: string;
  @ApiProperty()
  englishLevel: string;
  @ApiProperty()
  favouriteTopic: string;
  @ApiProperty()
  readonly email: string;
  @ApiProperty()
  readonly password: string;
}
