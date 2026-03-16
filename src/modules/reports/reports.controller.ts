import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/auth.decorator';
import { CoreConstant } from '../../common/constants/core.constant';
import { ApiResponse } from '../../common/dto/api-response.dto';

@ApiTags('Reports - Báo cáo')
@ApiBearerAuth('JWT-auth')
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('reports/completion-rate')
  @Roles(CoreConstant.SuperAdmin)
  @ApiOperation({
    summary:
      'Tính phần trăm hoàn thành = (số user progress=100 / số user progress=50) * 100',
  })
  async getLessonCompletionRate() {
    return ApiResponse.ok(await this.service.getLessonCompletionRate());
  }

  @Get('usage-time-metric')
  @Roles(CoreConstant.SuperAdmin)
  @ApiOperation({
    summary:
      'Tinh chi so thoi gian su dung = Tong(finishedAt - startedAt) / Tong so ban ghi user_sessions',
  })
  async getUsageTimeMetric() {
    return ApiResponse.ok(await this.service.getUsageTimeMetric());
  }

  @Get('session-frequency')
  @Roles(CoreConstant.SuperAdmin)
  @ApiOperation({
    summary:
      'Tinh tan suat session = so ban ghi user_sessions / so user distinct theo user_id',
  })
  async getSessionFrequency() {
    return ApiResponse.ok(await this.service.getSessionFrequency());
  }
}
