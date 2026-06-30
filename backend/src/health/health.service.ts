import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  getHealth() {
    return {
      status: 'ok',
      service: 'projectlink-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
