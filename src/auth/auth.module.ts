import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { AuthController } from './auth.controller';
import { CompanyAuthGuard } from './guards/companyAuth.guard';
import { CompanyAuthModule } from './submodules/companyAuth/companyAuth.module';
import { CompanyAuthService } from './submodules/companyAuth/companyAuth.service';
import { EmployeeAuthModule } from './submodules/employeeAuth/employeeAuth.module';
import { EmployeeAuthService } from './submodules/employeeAuth/employeeAuth.service';
import { UserModule } from 'src/modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    UserModule,
    CompanyAuthModule,
    EmployeeAuthModule,
  ],
  providers: [CompanyAuthGuard, EmployeeAuthService, CompanyAuthService],
  controllers: [AuthController],
  exports: [CompanyAuthGuard],
})
export class AuthModule {}
