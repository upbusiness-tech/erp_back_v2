import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';

export class InvalidOperationException extends BusinessException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST, 'Invalid Operation');
  }
}
