import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  readonly email: string;
  readonly password: string;
}
