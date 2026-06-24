import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { EmployeeEntity } from '../employee.entity';

@Injectable()
export class EmployeeDataUiService extends TypeOrmCrudService<EmployeeEntity> {
  constructor(
    @InjectRepository(EmployeeEntity) repo: Repository<EmployeeEntity>,
  ) {
    super(repo);
  }
}
