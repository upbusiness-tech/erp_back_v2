import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserModule } from 'src/modules/user/user.module';
import { AuthController } from './auth.controller';
import { CompanyAuthGuard } from './guards/companyAuth.guard';
import { EmployeeAuthGuard } from './guards/employeeAuth.guard';
import { AdminAuthModule } from './submodules/adminAuth/adminAuth.module';
import { AdminAuthService } from './submodules/adminAuth/adminAuth.service';
import { CompanyAuthModule } from './submodules/companyAuth/companyAuth.module';
import { CompanyAuthService } from './submodules/companyAuth/companyAuth.service';
import { EmployeeAuthModule } from './submodules/employeeAuth/employeeAuth.module';
import { EmployeeAuthService } from './submodules/employeeAuth/employeeAuth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    UserModule,
    CompanyAuthModule,
    EmployeeAuthModule,
    AdminAuthModule,
  ],
  providers: [
    CompanyAuthGuard,
    EmployeeAuthGuard,
    EmployeeAuthService,
    CompanyAuthService,
    AdminAuthService,
  ],
  controllers: [AuthController],
  exports: [CompanyAuthGuard, EmployeeAuthGuard],
})
export class AuthModule {}
