import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/roles';
import { firebaseAuth } from 'src/config/firebase/firebase.config';
import { AdminTokenPayload } from '../auth.types';

@Injectable()
export class CompanyAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-company-token'] as string;

    if (!token) throw new UnauthorizedException('Company token missed');

    if (await this.tryCompanyToken(request, token)) return true;
    if (this.tryAdminToken(request, token)) return true;

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

  private async tryCompanyToken(request: any, token: string): Promise<boolean> {
    try {
      const payload = await firebaseAuth.verifyIdToken(token);

      if (payload.role !== Role.COMPANY)
        throw new Error('Role Company não identificada');

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
}
