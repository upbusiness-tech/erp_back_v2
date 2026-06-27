import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CompanyTokenPayload, EmployeeTokenPayload } from 'src/auth/auth.types';
import { LoginEmployeeUserDto } from 'src/auth/dto/loginEmployeeUser.dto';
import { Role } from 'src/common/roles';
import { CompanyUserDataUiService } from 'src/modules/user/submodules/companyUser/domain/companyUserDataUi.service';
import { EmployeeUserDataUiService } from 'src/modules/user/submodules/employeeUser/domain/employeeUserDataUi.service';

@Injectable()
export class EmployeeAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly companyUserDataUiService: CompanyUserDataUiService,
    private readonly employeeUserDataUiService: EmployeeUserDataUiService,
  ) {}

  async login(dto: LoginEmployeeUserDto, company: CompanyTokenPayload) {
    try {
      const companyUserFound = await this.companyUserDataUiService.findOneBy({
        companyUid: company.companyUid,
      });

      const employee = await this.employeeUserDataUiService.findOneBy({
        username: dto.username,
        companyUid: companyUserFound.companyUid,
      });

      if (!employee) throw new Error('Employee not found');

      const passwordMatch = await bcrypt.compare(
        dto.password,
        employee.password,
      );

      if (!passwordMatch) throw new UnauthorizedException('Wrong password!');

      const payload: EmployeeTokenPayload = {
        uid: employee.uid,
        username: employee.username,
        role: Role.EMPLOYEE,
        companyUid: employee.companyUid,
      };

      return {
        employeeAccessToken: this.jwtService.sign(payload, {
          expiresIn: '8h',
          secret: this.configService.get('JWT_EMPLOYEE_SECRET'),
        }),
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    }
  }
}
