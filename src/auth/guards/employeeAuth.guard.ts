import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CompanyTokenPayload, EmployeeTokenPayload } from '../auth.types';

@Injectable()
export class EmployeeAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const employeeAccessToken = this.extractBearer(
      request.headers.authorization,
    );
    const companyToken = request.headers['x-company-token'] as string;

    if (!employeeAccessToken)
      throw new UnauthorizedException('Access token missed');
    if (!companyToken) throw new UnauthorizedException('Company token missed');

    try {
      const employeePayload = this.jwtService.verify<EmployeeTokenPayload>(
        employeeAccessToken,
        {
          secret: this.configService.get('JWT_EMPLOYEE_SECRET'),
        },
      );

      const companyPayload = this.jwtService.verify<CompanyTokenPayload>(
        companyToken,
        {
          secret: this.configService.get('JWT_COMPANY_SECRET'),
        },
      );

      if (employeePayload.companyUid !== companyPayload.companyUid) {
        throw new UnauthorizedException(
          'Tokens não correspondem à mesma empresa',
        );
      }

      request.employee = employeePayload;
      request.company = companyPayload;
      return true;
    } catch (e) {
      if (e instanceof UnauthorizedException) throw e;
      throw new UnauthorizedException('Employee Token inválido');
    }
  }

  private extractBearer(header?: string): string | null {
    if (!header) return null;
    const [type, token] = header.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
