import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/roles';
import { AdminTokenPayload, CompanyTokenPayload } from '../auth.types';

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

    if (this.tryAdminToken(request, token)) return true;
    if (this.tryCompanyToken(request, token)) return true;

    throw new UnauthorizedException('Token inválido');
  }

  private tryAdminToken(request: any, token: string): boolean {
    try {
      const payload = this.jwtService.verify<AdminTokenPayload>(token, {
        secret: this.configService.get('JWT_ADMIN_SECRET'),
      });

      if (payload.role !== Role.ADMIN) return false;

      const companyUid = request.headers['x-admin-company-uid'] as string;
      if (!companyUid) {
        throw new UnauthorizedException(
          'Header x-admin-company-uid é obrigatório para admin',
        );
      }

      const companyPayload = {
        companyUid,
        role: Role.ADMIN,
        plan: 0,
        permissions: payload.permissions,
      };

      request.company = companyPayload;
      request.user = {
        uid: payload.uid,
        role: Role.ADMIN,
        companyUid,
        permissions: payload.permissions,
        isAdmin: true,
      };
      return true;
    } catch {
      return false;
    }
  }

  private tryCompanyToken(request: any, token: string): boolean {
    try {
      const payload = this.jwtService.verify<CompanyTokenPayload>(token, {
        secret: this.configService.get('JWT_COMPANY_SECRET'),
      });

      if (payload.role !== Role.COMPANY) throw new Error();

      request.company = payload;
      request.user = {
        uid: payload.companyUid,
        role: payload.role,
        companyUid: payload.companyUid,
        permissions: payload.permissions ?? [],
        isAdmin: false,
      };
      return true;
    } catch (error: any) {
      console.error({ error });
      return false;
    }
  }

  private extractBearer(header?: string): string | null {
    if (!header) return null;
    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
