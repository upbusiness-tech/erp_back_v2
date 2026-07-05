import { HttpStatus } from '@nestjs/common';
import { BusinessException } from './business.exception';

export class ResourceNotFoundException extends BusinessException {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} com identificador ${identifier} não encontrado`
      : `${resource} não encontrado`;
    super(message, HttpStatus.NOT_FOUND, 'Resource Not Found');
  }
}
