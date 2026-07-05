import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { generateUsername } from 'src/common/username';
import { encryptPassword, getDefaultPassword } from 'src/consts/bcrypt';
import { CreateEmployeeUserDto } from 'src/modules/user/submodules/employeeUser/dto/createEmployeeUser.dto';
import { EmployeeUserEntity } from 'src/modules/user/submodules/employeeUser/employeeUser.entity';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from '../dto/createEmployee.dto';
import { EmployeeEntity } from '../employee.entity';
import { CompanyTokenPayload } from 'src/auth/auth.types';

@Injectable()
export class CreateEmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private repo: Repository<EmployeeEntity>,
  ) {}

  async execute(dto: CreateEmployeeDto, currentCompany: CompanyTokenPayload) {
    await this.repo.manager.transaction(async (transactionManager) => {
      const { password, username, ...employeeValues } = dto;
      const companyUid = currentCompany.companyUid;
      const employeeSaved = await transactionManager.save(EmployeeEntity, {
        ...employeeValues,
        companyUid,
      });

      const passwordToSave = password
        ? await encryptPassword(password)
        : await getDefaultPassword();

      let usernameToSave = username;

      if (!username) {
        while (!usernameToSave) {
          const generated = generateUsername(employeeSaved.name);
          const searchResult = await transactionManager.findOne(
            EmployeeUserEntity,
            {
              where: {
                username: generated,
              },
            },
          );

          if (!searchResult) {
            usernameToSave = generated;
          }
        }
      }

      const employeeUserDto: CreateEmployeeUserDto = {
        employeeUid: employeeSaved.uid,
        password: passwordToSave,
        username: usernameToSave,
      };

      const employeeUserSaved = await transactionManager.save(
        EmployeeUserEntity,
        { ...employeeUserDto, companyUid },
      );

      return {
        ...employeeSaved,
        username,
        userUid: employeeUserSaved.uid,
      };
    });
  }
}
