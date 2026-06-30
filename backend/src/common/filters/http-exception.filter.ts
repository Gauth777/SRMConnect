import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;
    let error: string;

    if (exception instanceof HttpException) {
      const resContent = exception.getResponse();
      if (typeof resContent === 'object') {
        message = (resContent as any).message || exception.message;
        error = (resContent as any).error || exception.name;
      } else {
        message = resContent;
        error = exception.name;
      }
    } else {
      message = exception.message || 'Internal server error';
      error = 'Internal Server Error';
    }

    // Log the error internally
    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} - Error: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${request.url} - Error: ${message}`);
    }

    const errorResponse = {
      statusCode: status,
      message: Array.isArray(message) ? message.join(', ') : message,
      error: error,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorResponse);
  }
}
