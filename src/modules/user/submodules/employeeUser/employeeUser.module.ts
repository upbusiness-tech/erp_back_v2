import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeUserEntity } from './employeeUser.entity';
import { EmployeeUserService } from './employeeUser.service';
import { EmployeeUserController } from './employeeUser.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EmployeeUserEntity])],
  providers: [EmployeeUserService],
  controllers: [EmployeeUserController],
})
export class EmployeeUserModule {}
