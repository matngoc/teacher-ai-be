export class CommonResultDto<T> {
  isSuccessful: boolean;
  message?: string;
  data?: T;
  error?: any;
  timestamp: string;
  path?: string;

  constructor(partial: Partial<CommonResultDto<T>>) {
    Object.assign(this, partial);
    this.timestamp = new Date().toISOString();
  }

  static success<T>(data?: T, message = 'Thành công'): CommonResultDto<T> {
    return new CommonResultDto<T>({
      isSuccessful: true,
      message,
      data,
    });
  }

  static error<T>(message = 'Có lỗi xảy ra', error?: any): CommonResultDto<T> {
    return new CommonResultDto<T>({
      isSuccessful: false,
      message,
      error,
    });
  }
}
