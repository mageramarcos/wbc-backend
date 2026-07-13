import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { Prisma } from '@prisma/client';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      const message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as Record<string, unknown>).message || exception.message;

      return response.status(status).send({
        success: false,
        message: Array.isArray(message) ? message.join('; ') : message,
        statusCode: status,
        timestamp: new Date().toISOString(),
      });
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        return response.status(HttpStatus.CONFLICT).send({
          success: false,
          message: 'A record with this value already exists',
          statusCode: HttpStatus.CONFLICT,
          timestamp: new Date().toISOString(),
        });
      }
      if (exception.code === 'P2025') {
        return response.status(HttpStatus.NOT_FOUND).send({
          success: false,
          message: 'Record not found',
          statusCode: HttpStatus.NOT_FOUND,
          timestamp: new Date().toISOString(),
        });
      }
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: 'An unexpected error occurred',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp: new Date().toISOString(),
    });
  }
}
