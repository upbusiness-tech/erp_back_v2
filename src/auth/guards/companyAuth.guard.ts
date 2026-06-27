import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CompanyTokenPayload } from '../auth.types';
import { Role } from 'src/common/roles';

@Injectable()
export class CompanyAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractBearer(request.headers.authorization);

    if (!token) throw new UnauthorizedException('Company token missed');

    try {
      const payload = this.jwtService.verify<CompanyTokenPayload>(token, {
        secret: this.configService.get('JWT_COMPANY_SECRET'),
      });

      if (payload.role !== Role.COMPANY) throw new Error();

      request.company = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Company token inválido');
    }
  }

  private extractBearer(header?: string): string | null {
    if (!header) return null;
    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
