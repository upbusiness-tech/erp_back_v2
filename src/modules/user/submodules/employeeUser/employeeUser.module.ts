import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyModule } from 'src/modules/company/company.module';
import { EmployeeModule } from 'src/modules/employee/employee.module';
import { CreateEmployeeUserService } from './domain/createEmployeeUser.service';
import { EmployeeUserDataUiService } from './domain/employeeUserDataUi.service';
import { EmployeeUserController } from './employeeUser.controller';
import { EmployeeUserEntity } from './employeeUser.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmployeeUserEntity]),
    EmployeeModule,
    CompanyModule,
  ],
  controllers: [EmployeeUserController],
  providers: [CreateEmployeeUserService, EmployeeUserDataUiService],
  exports: [EmployeeUserDataUiService],
})
export class EmployeeUserModule {}
