import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';
import { ErrorResponse } from './handler.types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);
    this.logException(
      exception,
      request,
      errorResponse.statusCode,
      errorResponse.message.toString(),
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as any).message ?? exception.message);
      const error = typeof res === 'object' ? (res as any).error : undefined;

      this.logger.error({ res });
      return { statusCode: status, timestamp, path, method, message, error };
    }

    if (exception instanceof EntityNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        timestamp,
        path,
        method,
        message: 'Registro não encontrado',
      };
    }

    if (exception instanceof QueryFailedError) {
      return this.handleQueryFailedError(exception, timestamp, path, method);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      method,
      message: 'Erro interno do servidor',
    };
  }

  private handleQueryFailedError(
    exception: QueryFailedError,
    timestamp: string,
    path: string,
    method: string,
  ): ErrorResponse {
    const driverError = (exception as any).driverError;
    const code = driverError?.code;

    switch (code) {
      case '23505':
        return {
          statusCode: HttpStatus.CONFLICT,
          timestamp,
          path,
          method,
          message: 'Registro duplicado',
        };
      case '23503':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp,
          path,
          method,
          message: 'Violação de chave estrangeira',
        };
      case '23502':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp,
          path,
          method,
          message: `Campo obrigatório não informado: ${driverError?.column}`,
        };
      default:
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          timestamp,
          path,
          method,
          message: 'Erro ao processar operação no banco de dados',
        };
    }
  }

  private logException(
    exception: unknown,
    request: Request,
    statusCode: number,
    message: string,
  ) {
    const context = `${request.method} ${request.url}`;
    if (statusCode >= 500) {
      this.logger.error(context, (exception as Error)?.stack);
    } else {
      this.logger.warn(`${context} - ${statusCode} - ${message}`);
    }
  }
}
