import { ApiProperty } from '@nestjs/swagger';

export class LessonCompletionRateResponseDto {
  @ApiProperty({
    description: 'Số người dùng bắt đầu bài học (progressPercent = 0)',
  })
  startedUsers: number;

  @ApiProperty({
    description: 'Số người dùng hoàn thành bài học (progressPercent = 100)',
  })
  completedUsers: number;

  @ApiProperty({
    description: 'Phần trăm hoàn thành = (completedUsers / startedUsers) * 100',
    example: 75.5,
  })
  completionPercent: number;
}

export class UsageTimeMetricResponseDto {
  @ApiProperty({
    description:
      'Tong thoi gian hoc (giay) = Tong(finishedAt - startedAt) voi cac ban ghi co du startedAt va finishedAt',
    example: 3600,
  })
  totalUsageSeconds: number;

  @ApiProperty({
    description: 'Tong so ban ghi trong bang user_sessions',
    example: 24,
  })
  totalSessions: number;

  @ApiProperty({
    description:
      'Chi so thoi gian su dung = totalUsageSeconds / totalSessions (giay/session)',
    example: 150,
  })
  usageTimeMetric: number;
}
export class SessionFrequencyResponseDto {
  @ApiProperty({
    description: 'Tong so ban ghi trong bang user_sessions',
    example: 120,
  })
  totalSessions: number;

  @ApiProperty({
    description: 'Tong so user (distinct user_id) trong user_sessions',
    example: 30,
  })
  totalUsers: number;

  @ApiProperty({
    description: 'Tan suat session = totalSessions / totalUsers',
    example: 4,
  })
  sessionFrequency: number;
}
