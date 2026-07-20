import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyTokenPayload } from 'src/auth/auth.types';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { UserEntity } from 'src/modules/user/user.entity';
import { Repository } from 'typeorm';
import { EmployeeEntity } from '../employee.entity';

@Injectable()
export class DeleteEmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private repo: Repository<EmployeeEntity>,
  ) {}

  async execute(uid: string, currentCompany: CompanyTokenPayload) {
    await this.repo.manager.transaction(async (transactionManager) => {
      const employee = await transactionManager.findOne(EmployeeEntity, {
        where: {
          uid,
          companyUid: currentCompany.companyUid,
          isPrimaryEmployee: false,
        },
      });

      if (!employee) {
        throw new ResourceNotFoundException('Funcionário');
      }

      await transactionManager.softDelete(UserEntity, { employeeUid: uid });
      await transactionManager.softDelete(EmployeeEntity, { uid });
    });
  }
}
