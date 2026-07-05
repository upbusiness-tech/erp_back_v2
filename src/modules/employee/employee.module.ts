import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeEntity } from './employee.entity';
import { EmployeeDataUiService } from './domain/employeeDataUi.service';
import { CreateEmployeeService } from './domain/createEmployee.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity])],
  controllers: [EmployeeController],
  providers: [EmployeeDataUiService, CreateEmployeeService],
  exports: [EmployeeDataUiService],
})
export class EmployeeModule {}
