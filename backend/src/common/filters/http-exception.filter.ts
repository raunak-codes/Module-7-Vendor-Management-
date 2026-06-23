import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exRes = exception.getResponse();
      message = typeof exRes === 'string' ? exRes : (exRes as any).message ?? message;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        const fields = (exception.meta?.target as string[])?.join(', ');
        message = `Duplicate value: ${fields} already exists`;
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      }
    }

    this.logger.error(`${req.method} ${req.url} → ${status}: ${message}`, exception instanceof Error ? exception.stack : '');

    res.status(status).json({
      success: false,
      message,
      data: null,
      pagination: null,
      errors: process.env.NODE_ENV === 'development' && exception instanceof Error
        ? [{ stack: exception.stack }]
        : [],
    });
  }
}
