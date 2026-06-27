import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmployeeUserEntity } from '../employeeUser.entity';

@Injectable()
export class EmployeeUserDataUiService extends TypeOrmCrudService<EmployeeUserEntity> {
  constructor(
    @InjectRepository(EmployeeUserEntity) repo: Repository<EmployeeUserEntity>,
  ) {
    super(repo);
  }
}
