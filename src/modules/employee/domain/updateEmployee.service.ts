import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyTokenPayload } from 'src/auth/auth.types';
import { encryptPassword } from 'src/consts/bcrypt';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { PermissionEntity } from 'src/modules/permission/permission.entity';
import { UserEntity } from 'src/modules/user/user.entity';
import { In, Repository } from 'typeorm';
import { CreateEmployeeDto } from '../dto/createEmployee.dto';
import { EmployeeEntity } from '../employee.entity';

@Injectable()
export class UpdateEmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private repo: Repository<EmployeeEntity>,
  ) {}

  async execute(
    uid: string,
    dto: CreateEmployeeDto,
    currentCompany: CompanyTokenPayload,
  ) {
    await this.repo.manager.transaction(async (transactionManager) => {
      const { password, permissions, username, ...employeeValues } = dto;

      const employee = await transactionManager.findOne(EmployeeEntity, {
        where: { uid, companyUid: currentCompany.companyUid },
      });

      if (!employee) {
        throw new ResourceNotFoundException('Funcionário');
      }

      Object.assign(employee, employeeValues);
      await transactionManager.save(EmployeeEntity, employee);

      const user = await transactionManager.findOne(UserEntity, {
        where: { employeeUid: uid },
      });

      if (!user) {
        throw new ResourceNotFoundException('Usuário');
      }

      if (username !== undefined) {
        user.username = username;
      }

      if (password !== undefined) {
        user.password = await encryptPassword(password);
      }

      if (permissions) {
        const permissionEntities = await transactionManager.findBy(
          PermissionEntity,
          { id: In(permissions) },
        );
        user.permissions = permissionEntities;
      }

      await transactionManager.save(UserEntity, user);
    });
  }
}
