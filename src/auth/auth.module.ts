import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyUserEntity } from 'src/modules/user/submodules/companyUser/companyUser.entity';
import { CompanyUserModule } from 'src/modules/user/submodules/companyUser/companyUser.module';
import { EmployeeUserEntity } from 'src/modules/user/submodules/employeeUser/employeeUser.entity';
import { EmployeeUserModule } from 'src/modules/user/submodules/employeeUser/employeeUser.module';
import { AuthController } from './auth.controller';
import { CompanyAuthGuard } from './guards/companyAuth.guard';
import { CompanyAuthModule } from './submodules/companyAuth/companyAuth.module';
import { CompanyAuthService } from './submodules/companyAuth/companyAuth.service';
import { EmployeeAuthModule } from './submodules/employeeAuth/employeeAuth.module';
import { EmployeeAuthService } from './submodules/employeeAuth/employeeAuth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CompanyUserEntity, EmployeeUserEntity]),
    CompanyUserModule,
    EmployeeUserModule,
    CompanyAuthModule,
    EmployeeAuthModule,
  ],
  providers: [CompanyAuthGuard, EmployeeAuthService, CompanyAuthService],
  controllers: [AuthController],
  exports: [CompanyAuthGuard],
})
export class AuthModule {}
