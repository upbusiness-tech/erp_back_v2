import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyUserEntity } from 'src/modules/user/submodules/companyUser/companyUser.entity';
import { CompanyUserModule } from 'src/modules/user/submodules/companyUser/companyUser.module';
import { EmployeeUserModule } from 'src/modules/user/submodules/employeeUser/employeeUser.module';
import { CompanyAuthService } from './companyAuth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyUserEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_COMPANY_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    CompanyUserModule,
    EmployeeUserModule,
  ],
  providers: [CompanyAuthService],
  exports: [CompanyAuthService],
})
export class CompanyAuthModule {}
