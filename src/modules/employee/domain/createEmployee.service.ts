import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyTokenPayload } from 'src/auth/auth.types';
import { generateUsername } from 'src/common/username';
import { encryptPassword, getDefaultPassword } from 'src/consts/bcrypt';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserType } from 'src/modules/user/user.enum';
import { In, Repository } from 'typeorm';
import { CreateEmployeeDto } from '../dto/createEmployee.dto';
import { EmployeeEntity } from '../employee.entity';
import { PermissionEntity } from 'src/modules/permission/permission.entity';
import { EmployeeDefaultPermissions } from 'src/modules/permission/const/employee-default-permissions.ref';

@Injectable()
export class CreateEmployeeService {
  constructor(
    @InjectRepository(EmployeeEntity)
    private repo: Repository<EmployeeEntity>,
  ) {}

  async execute(dto: CreateEmployeeDto, currentCompany: CompanyTokenPayload) {
    await this.repo.manager.transaction(async (transactionManager) => {
      const { password, permissions, username, ...employeeValues } = dto;
      const companyUid = currentCompany.companyUid;
      const employeeSaved = await transactionManager.save(EmployeeEntity, {
        ...employeeValues,
        companyUid,
      });

      const passwordToSave =
        password && password !== ''
          ? await encryptPassword(password)
          : await getDefaultPassword();

      let usernameToSave = username;

      if (!username) {
        while (!usernameToSave) {
          const generated = generateUsername(employeeSaved.name);
          const searchResult = await transactionManager.findOne(UserEntity, {
            where: {
              username: generated,
            },
          });

          if (!searchResult) {
            usernameToSave = generated;
          }
        }
      }

      let foundPermissions;
      if (permissions) {
        foundPermissions = await transactionManager.find(PermissionEntity, {
          where: {
            id: In(permissions),
            isAdminPermission: false,
          },
        });
      } else {
        const defaultPermissions = EmployeeDefaultPermissions[dto.type];
        foundPermissions = await transactionManager.find(PermissionEntity, {
          where: {
            key: In(defaultPermissions),
            isAdminPermission: false,
          },
        });
      }

      const employeeUserDto: Partial<UserEntity> = {
        employeeUid: employeeSaved.uid,
        password: passwordToSave,
        username: usernameToSave,
        type: UserType.EMPLOYEE,
        permissions: foundPermissions,
        companyUid,
      };

      const employeeUserSaved = await transactionManager.save(
        UserEntity,
        employeeUserDto,
      );

      return {
        ...employeeSaved,
        username,
        userUid: employeeUserSaved.uid,
      };
    });
  }
}
