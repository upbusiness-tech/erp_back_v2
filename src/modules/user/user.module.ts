import { Module } from '@nestjs/common';
import { EmployeeUserModule } from './submodules/employeeUser/employeeUser.module';
import { CompanyUserModule } from './submodules/companyUser/companyUser.module';

@Module({
  imports: [EmployeeUserModule, CompanyUserModule],
})
export class UserModule {}
