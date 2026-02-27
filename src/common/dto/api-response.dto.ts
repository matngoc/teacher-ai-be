import { ApiProperty } from '@nestjs/swagger';

export class ApiResponse<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  data?: T;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty()
  timestamp: string;

  constructor(partial: Partial<ApiResponse<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static ok<T>(data?: T, message = 'Thành công'): ApiResponse<T> {
    return new ApiResponse<T>({ success: true, message, data });
  }

  static created<T>(data?: T, message = 'Tạo mới thành công'): ApiResponse<T> {
    return new ApiResponse<T>({ success: true, message, data });
  }

  static fail<T>(
    message = 'Thao tác thất bại',
    error?: string,
  ): ApiResponse<T> {
    return new ApiResponse<T>({ success: false, message, error });
  }
}
