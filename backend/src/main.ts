import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || configService.get<number>('PORT') || 4000;
  const frontendUrl =
    configService.get<string>('frontendUrl') ||
    configService.get<string>('FRONTEND_URL') ||
    'http://localhost:3000';

  const allowedOrigins = frontendUrl
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  // Apply Helmet for security headers
  app.use(helmet());

  // Configure CORS for local development plus deployed frontend origins.
  app.enableCors({
    origin: (origin, callback) => {
      // Allow server-to-server requests and tools that do not send an Origin header.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin not allowed by CORS: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Apply Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Apply Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configure Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SRMConnect API')
    .setDescription('Backend services for SRMConnect (projectlink-backend)')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  await app.listen(port);

  logger.log(`====================================================`);
  logger.log(` SRMConnect Backend (projectlink-backend) Started `);
  logger.log(`====================================================`);
  logger.log(` Local API Server: http://localhost:${port}/api/v1`);
  logger.log(` Swagger Docs:     http://localhost:${port}/docs`);
  logger.log(` Allowed CORS:     ${allowedOrigins.join(', ')}`);
  logger.log(`====================================================`);
}
bootstrap();
