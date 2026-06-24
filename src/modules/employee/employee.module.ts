import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeController } from './employee.controller';
import { EmployeeEntity } from './employee.entity';
import { EmployeeDataUiService } from './domain/employeeDataUi.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeEntity])],
  controllers: [EmployeeController],
  providers: [EmployeeDataUiService],
})
export class EmployeeModule {}
