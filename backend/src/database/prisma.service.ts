import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('database.url');
    super({
      datasources: {
        db: {
          url: databaseUrl || 'postgresql://dummy:dummy@localhost:5432/dummy',
        },
      },
    });
  }

  async onModuleInit() {
    const databaseUrl = this.configService.get<string>('database.url');
    if (!databaseUrl) {
      this.logger.warn(
        'DATABASE_URL is not configured. Prisma will not attempt to connect to the database.',
      );
      return;
    }

    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Successfully connected to the database.');
    } catch (error) {
      this.logger.error(`Failed to connect to the database on initialization: ${error.message}`);
      // Do not rethrow to avoid crashing the entire application during foundation setup
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from the database.');
    }
  }
}
