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
import { AdminTokenPayload, EmployeeTokenPayload } from '../auth.types';

@Injectable()
export class EmployeeAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const employeeAccessToken = this.extractBearer(
      request.headers.authorization,
    );

    if (!employeeAccessToken)
      throw new UnauthorizedException('Employee access token missed');

    // const adminTokenResult = this.tryAdminToken(request, employeeAccessToken);
    // if (adminTokenResult) return true;

    const employeeTokenResult = await this.tryEmployeeToken(
      request,
      employeeAccessToken,
    );
    if (employeeTokenResult) return true;

    throw new UnauthorizedException('Token funcionário inválido');
  }

  private tryAdminToken(request: any, token: string): boolean {
    try {
      const adminPayload = this.jwtService.verify<AdminTokenPayload>(token, {
        secret: this.configService.get('JWT_ADMIN_SECRET'),
      });

      if (adminPayload.role !== Role.ADMIN) return false;

      const companyUid = request.headers['x-company-token'] as string;
      if (!companyUid) {
        throw new UnauthorizedException(
          'Header x-company-token é obrigatório para admin',
        );
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

  private async tryEmployeeToken(
    request: any,
    token: string,
  ): Promise<boolean> {
    const companyToken = request.headers['x-company-token'] as string;
    if (!companyToken) return false;

    try {
      const employeePayload = this.jwtService.verify<EmployeeTokenPayload>(
        token,
        {
          secret: this.configService.get('JWT_EMPLOYEE_SECRET'),
        },
      );

      const companyPayload = await firebaseAuth.verifyIdToken(companyToken);

      if (employeePayload.companyUid !== companyPayload.companyUid) {
        throw new UnauthorizedException(
          'Tokens não correspondem à mesma empresa',
        );
      }

      request.employee = employeePayload;
      request.company = companyPayload;
      request.user = {
        uid: employeePayload.uid,
        role: employeePayload.role,
        companyUid: employeePayload.companyUid,
        permissions: employeePayload.permissions ?? [],
        isAdmin: false,
      };
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      return false;
    }
  }

  private extractBearer(header?: string): string | null {
    if (!header) return null;
    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
