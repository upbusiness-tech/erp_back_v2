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
      const employee = await this.userDataUiService.findOneBy({
        username: dto.username,
        companyUid: company.companyUid,
        type: UserType.EMPLOYEE,
      });

      if (!employee) throw new ResourceNotFoundException('Employee not found');

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
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
