import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminTokenPayload } from 'src/auth/auth.types';
import { LoginCompanyUserDto } from 'src/auth/dto/loginCompanyUser.dto';
import { Role } from 'src/common/roles';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { UserType } from 'src/modules/user/user.enum';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userDataUiService: UserDataUiService,
  ) {}

  async login(dto: LoginCompanyUserDto) {
    try {
      const adminUser = await this.userDataUiService.findOne({
        where: {
          email: dto.email,
          type: UserType.ADMIN,
        },
        relations: {
          permissions: true,
        },
      });

      if (!adminUser) throw new ResourceNotFoundException('AdminUser');

      const passwordMatch = await bcrypt.compare(
        dto.password,
        adminUser.password,
      );

      if (!passwordMatch) throw new UnauthorizedException('Wrong password!');

      const permissions = (adminUser.permissions ?? []).map((p) => p.key);

      const payload: AdminTokenPayload = {
        uid: adminUser.uid,
        email: adminUser.email,
        role: Role.ADMIN,
        isAdmin: true,
        permissions,
      };

      return {
        accessToken: this.jwtService.sign(payload, {
          expiresIn: '12h',
          secret: this.configService.get('JWT_ADMIN_SECRET'),
        }),
        permissions,
      };
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
