import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/common/roles';
import { AdminTokenPayload } from '../auth.types';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const accessToken = this.extractBearer(request.headers.authorization);

    if (!accessToken)
      throw new UnauthorizedException('Admin access token missed');

    const adminTokenResult = this.tryAdminToken(request, accessToken);
    if (adminTokenResult) return true;

    throw new UnauthorizedException('Token admin inválido');
  }

  private tryAdminToken(request: any, token: string): boolean {
    try {
      const adminPayload = this.jwtService.verify<AdminTokenPayload>(token, {
        secret: this.configService.get('JWT_ADMIN_SECRET'),
      });

      if (adminPayload.role !== Role.ADMIN) return false;

      const companyUid = request.headers['x-company-uid'] as string;
      if (!companyUid) {
        console.debug(`Company Uid was not informed.`);
      }

      request.employee = adminPayload;
      request.company = {
        companyUid,
        role: Role.ADMIN,
        plan: 0,
        permissions: [],
      };
      request.user = {
        uid: adminPayload.uid,
        role: Role.ADMIN,
        companyUid,
        permissions: adminPayload.permissions,
        isAdmin: true,
      };
      return true;
    } catch {
      return false;
    }
  }

  private extractBearer(header?: string): string | null {
    if (!header) return null;
    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
