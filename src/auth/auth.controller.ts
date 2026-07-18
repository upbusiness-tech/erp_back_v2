import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserType } from 'src/modules/user/user.enum';
import type { CompanyTokenPayload } from './auth.types';
import { CurrentCompany } from './decorators/currentCompany.decorator';
import { LoginCompanyUserDto } from './dto/loginCompanyUser.dto';
import { LoginEmployeeUserDto } from './dto/loginEmployeeUser.dto';
import { CompanyAuthGuard } from './guards/companyAuth.guard';
import { AdminAuthService } from './submodules/adminAuth/adminAuth.service';
import { CompanyAuthService } from './submodules/companyAuth/companyAuth.service';
import { EmployeeAuthService } from './submodules/employeeAuth/employeeAuth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly companyAuthService: CompanyAuthService,
    private readonly employeeAuthService: EmployeeAuthService,
    private readonly adminAuthService: AdminAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userDataUiService: UserDataUiService,
  ) {}

  @Post('login/company')
  async loginAsCompany(@Body() dto: LoginCompanyUserDto) {
    return await this.companyAuthService.login(dto);
  }

  @Post('login/employee')
  @UseGuards(CompanyAuthGuard)
  async loginAsEmployee(
    @Body() dto: LoginEmployeeUserDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.employeeAuthService.login(dto, company);
  }

  @Get('avaliable-employees')
  @UseGuards(CompanyAuthGuard)
  async avaliableEmployees(@CurrentCompany() company: CompanyTokenPayload) {
    return await this.employeeAuthService.getAvaliableEmployeeUsers(company);
  }

  @Post('login/admin')
  async loginAsAdmin(@Body() dto: LoginCompanyUserDto) {
    return await this.adminAuthService.login(dto);
  }

  // FIXME: debugar e estudar esse código, não entendi muito bem a importância/finalidade dele
  @Post('refresh')
  async refreshToken(@Body() body: { accessToken?: string }) {
    const token = body.accessToken;
    if (!token) {
      throw new HttpException('Token não fornecido', HttpStatus.BAD_REQUEST);
    }

    const secrets: {
      secret: string;
      type: string;
      findUser: (payload: any) => Promise<UserEntity | null>;
    }[] = [
      {
        secret: this.configService.get('JWT_EMPLOYEE_SECRET'),
        type: 'employee',
        findUser: async (payload) =>
          this.userDataUiService.findOne({
            where: { uid: payload.uid },
            relations: { permissions: true },
          }),
      },
      {
        secret: this.configService.get('JWT_COMPANY_SECRET'),
        type: 'company',
        findUser: async (payload) =>
          this.userDataUiService.findOne({
            where: {
              companyUid: payload.companyUid,
              type: UserType.COMPANY,
            },
            relations: { permissions: true },
          }),
      },
      {
        secret: this.configService.get('JWT_ADMIN_SECRET'),
        type: 'admin',
        findUser: async (payload) =>
          this.userDataUiService.findOne({
            where: { uid: payload.uid },
            relations: { permissions: true },
          }),
      },
    ];

    for (const { secret, type, findUser } of secrets) {
      try {
        const payload = this.jwtService.verify(token, { secret });
        const user = await findUser(payload);

        if (!user) continue;

        const permissions = (user.permissions ?? []).map((p) => p.key);
        const newPayload = { ...payload, permissions };

        return {
          accessToken: this.jwtService.sign(newPayload, { secret }),
          permissions,
          type,
        };
      } catch {
        continue;
      }
    }

    throw new HttpException(
      'Token inválido ou expirado',
      HttpStatus.UNAUTHORIZED,
    );
  }
}
