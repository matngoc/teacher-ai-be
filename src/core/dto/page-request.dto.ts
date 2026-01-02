import { ApiProperty } from '@nestjs/swagger';

export class PageRequestDto {
  @ApiProperty()
  readonly filters: any;
  @ApiProperty()
  readonly page: number;
  @ApiProperty()
  readonly size: number;
}
