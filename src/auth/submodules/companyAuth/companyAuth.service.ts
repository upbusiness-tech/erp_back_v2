import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CompanyTokenPayload } from 'src/auth/auth.types';
import { LoginCompanyUserDto } from 'src/auth/dto/loginCompanyUser.dto';
import { Role } from 'src/common/roles';
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
        },
      });

      if (!companyUser) throw new Error('Company not found');

      const passwordMatch = await bcrypt.compare(
        dto.password,
        companyUser.password,
      );

      if (!passwordMatch) throw new UnauthorizedException('Wrong password!');

      const payload: CompanyTokenPayload = {
        companyUid: companyUser.companyUid,
        plan: companyUser.company.planId,
        role: Role.COMPANY,
      };

      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: '12h',
          secret: this.configService.get('JWT_COMPANY_SECRET'),
        }),
      };
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      throw new Error(error);
    }
  }
}
