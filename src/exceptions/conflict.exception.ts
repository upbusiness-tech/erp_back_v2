import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';

export class ResourceConflictException extends BusinessException {
  constructor(message: string) {
    super(message, HttpStatus.CONFLICT, 'Resource Conflict');
  }
}
