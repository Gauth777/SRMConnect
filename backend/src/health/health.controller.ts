import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check service health status' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        service: { type: 'string', example: 'projectlink-backend' },
        timestamp: { type: 'string', example: '2026-06-30T21:33:14Z' },
        uptime: { type: 'number', example: 123.45 },
      },
    },
  })
  getHealth() {
    return this.healthService.getHealth();
  }
}
