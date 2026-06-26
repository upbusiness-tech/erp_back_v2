import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyUserEntity } from '../companyUser.entity';

@Injectable()
export class CompanyUserDataUiService extends TypeOrmCrudService<CompanyUserEntity> {
  constructor(
    @InjectRepository(CompanyUserEntity) repo: Repository<CompanyUserEntity>,
  ) {
    super(repo);
  }
}
