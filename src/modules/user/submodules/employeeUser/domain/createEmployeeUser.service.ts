import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { CompanyTokenPayload } from 'src/auth/auth.types';
import { saltRounds } from 'src/consts/bcrypt';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { EmployeeDataUiService } from 'src/modules/employee/domain/employeeDataUi.service';
import { Repository } from 'typeorm';
import { CreateEmployeeUserDto } from '../dto/createEmployeeUser.dto';
import { EmployeeUserEntity } from '../employeeUser.entity';

@Injectable()
export class CreateEmployeeUserService {
  constructor(
    @InjectRepository(EmployeeUserEntity)
    private readonly repo: Repository<EmployeeUserEntity>,
    private employeeDataUiService: EmployeeDataUiService,
    private companyDataUiService: CompanyNestCrudService,
  ) {}

  async execute(dto: CreateEmployeeUserDto, companyToken: CompanyTokenPayload) {
    const company = await this.companyDataUiService.findOne({
      where: {
        uid: companyToken.companyUid,
      },
    });

    if (!company) throw new Error('Company not found!');

    const employee = await this.employeeDataUiService.findOne({
      where: {
        companyUid: company.uid,
        uid: dto.employeeUid,
      },
    });

    if (!employee) throw new Error('Employee not found!');

    const salt = await bcrypt.genSalt(saltRounds);
    const encriptedPassoword = await bcrypt.hash(dto.password, salt);
    await this.repo.save({
      ...dto,
      password: encriptedPassoword,
      companyUid: company.uid,
    });
  }
}
