import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyUserEntity } from 'src/modules/user/submodules/companyUser/companyUser.entity';
import { CompanyUserModule } from 'src/modules/user/submodules/companyUser/companyUser.module';
import { EmployeeUserEntity } from 'src/modules/user/submodules/employeeUser/employeeUser.entity';
import { EmployeeUserModule } from 'src/modules/user/submodules/employeeUser/employeeUser.module';
import { EmployeeAuthService } from './employeeAuth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyUserEntity, EmployeeUserEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_EMPLOYEE_SECRET'),
        signOptions: {
          expiresIn: '12h',
        },
      }),
    }),
    CompanyUserModule,
    EmployeeUserModule,
  ],
  providers: [EmployeeAuthService],
  exports: [EmployeeAuthService],
})
export class EmployeeAuthModule {}
