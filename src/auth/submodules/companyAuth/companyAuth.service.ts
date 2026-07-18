import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CompanyTokenPayload } from 'src/auth/auth.types';
import { LoginCompanyUserDto } from 'src/auth/dto/loginCompanyUser.dto';
import { Role } from 'src/common/roles';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { UserType } from 'src/modules/user/user.enum';

@Injectable()
export class CompanyAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly companyUserDataUiService: UserDataUiService,
  ) {}

  async login(dto: LoginCompanyUserDto) {
    try {
      const companyUser = await this.companyUserDataUiService.findOne({
        where: {
          email: dto.email,
          type: UserType.COMPANY,
        },
        relations: {
          company: true,
          permissions: true,
        },
      });

      if (!companyUser) throw new ResourceNotFoundException('CompanyUser');

      const passwordMatch = await bcrypt.compare(
        dto.password,
        companyUser.password,
      );

      if (!passwordMatch) throw new UnauthorizedException('Wrong password!');

      const permissions = (companyUser.permissions ?? []).map((p) => p.key);

      const payload: CompanyTokenPayload = {
        companyUid: companyUser.companyUid,
        plan: companyUser.company.planId,
        role: Role.COMPANY,
        permissions,
      };

      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: '12h',
          secret: this.configService.get('JWT_COMPANY_SECRET'),
        }),
        permissions,
        name: companyUser.company.name,
      };
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
