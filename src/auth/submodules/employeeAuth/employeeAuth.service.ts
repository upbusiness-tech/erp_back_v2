import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CompanyTokenPayload, EmployeeTokenPayload } from 'src/auth/auth.types';
import { LoginEmployeeUserDto } from 'src/auth/dto/loginEmployeeUser.dto';
import { Role } from 'src/common/roles';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { UserType } from 'src/modules/user/user.enum';

@Injectable()
export class EmployeeAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userDataUiService: UserDataUiService,
  ) {}

  async login(dto: LoginEmployeeUserDto, company: CompanyTokenPayload) {
    try {
      const employeeUser = await this.userDataUiService.findOne({
        where: {
          username: dto.username,
          companyUid: company.companyUid,
          type: UserType.EMPLOYEE,
        },
        relations: {
          permissions: true,
          employee: true,
        },
      });

      if (!employeeUser)
        throw new ResourceNotFoundException('Employee not found');

      const passwordMatch = await bcrypt.compare(
        dto.password,
        employeeUser.password,
      );

      if (!passwordMatch) throw new UnauthorizedException('Wrong password!');

      const permissions = (employeeUser.permissions ?? []).map((p) => p.key);

      const payload: EmployeeTokenPayload = {
        uid: employeeUser.uid,
        username: employeeUser.username,
        role: Role.EMPLOYEE,
        companyUid: employeeUser.companyUid,
        permissions,
      };

      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: '8h',
          secret: this.configService.get('JWT_EMPLOYEE_SECRET'),
        }),
        permissions,
        name: employeeUser.employee.name,
      };
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async getAvaliableEmployeeUsers(company: CompanyTokenPayload) {
    try {
      const employeesUsers = await this.userDataUiService.find({
        where: {
          companyUid: company.companyUid,
          type: UserType.EMPLOYEE,
          employee: {
            isActive: true,
          },
        },
        relations: {
          employee: true,
        },
        select: {
          username: true,
          employee: {
            name: true,
            type: true,
          },
        },
      });

      return employeesUsers;
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
