import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
    error?: string,
  ) {
    super({ message, error: error ?? 'Business Rule Violation' }, status);
  }
}
