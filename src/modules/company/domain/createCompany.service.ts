import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { getFirstPaymentDate } from 'src/common/date';
import { generateUsername } from 'src/common/username';
import { saltRounds } from 'src/consts/bcrypt';
import { EmployeeEntity } from 'src/modules/employee/employee.entity';
import { EmployeeType } from 'src/modules/employee/employee.enum';
import { CreateInvoiceDto } from 'src/modules/invoice/dto/createInvoice.dto';
import { InvoiceEntity } from 'src/modules/invoice/invoice.entity';
import { InvoiceStatus } from 'src/modules/invoice/invoice.enum';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserType } from 'src/modules/user/user.enum';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../company.entity';
import { CompanyStatus } from '../company.enum';
import { CreateCompanyDto } from '../dto/createCompany.dto';
import { CompanySettingService } from '../submodules/companySettings/domain/companySetting.service';
import { CompanyNestCrudService } from './companyNestCrud.service';

@Injectable()
export class CreateCompanyService {
  constructor(
    public companyDataUiService: CompanyNestCrudService,
    @InjectRepository(CompanyEntity)
    private repo: Repository<CompanyEntity>,
    private readonly companySettingService: CompanySettingService,
  ) {}

  async execute(dto: CreateCompanyDto) {
    try {
      const { email, password, managerName, ...values } = dto;

      await this.repo.manager.transaction(
        async (transactionalEntityManager) => {
          const companySaved = await transactionalEntityManager.save(
            CompanyEntity,
            { ...values, status: CompanyStatus.ACTIVE },
          );

          const companyUserDto: Partial<UserEntity> = {
            companyUid: companySaved.uid,
            email: email,
            password: await this.encryptPassword(password),
            type: UserType.COMPANY,
          };

          await transactionalEntityManager.save(UserEntity, companyUserDto);

          const firstEmployeeDto: Partial<EmployeeEntity> = {
            companyUid: companySaved.uid,
            isActive: true,
            name: managerName,
            type: EmployeeType.MANAGER,
            isPrimaryEmployee: true,
          };

          const employeeSaved = await transactionalEntityManager.save(
            EmployeeEntity,
            firstEmployeeDto,
          );

          let usernameGenerated = '';

          while (usernameGenerated === '') {
            const generated = generateUsername(managerName);
            const searchResult = await transactionalEntityManager.findOne(
              UserEntity,
              {
                where: {
                  username: generated,
                },
              },
            );

            if (!searchResult) {
              usernameGenerated = generated;
            }
          }

          const employeeUserDto: Partial<UserEntity> = {
            employeeUid: employeeSaved.uid,
            password: await this.encryptPassword('1234'),
            username: usernameGenerated,
            companyUid: companySaved.uid,
            type: UserType.EMPLOYEE,
          };

          await transactionalEntityManager.save(UserEntity, employeeUserDto);

          const firstInvoiceDto: CreateInvoiceDto = {
            companyUid: companySaved.uid,
            paidAt: null,
            status: InvoiceStatus.PENDING,
            dueDate: getFirstPaymentDate(values.paymentDay),
          };

          // await transactionalEntityManager.save(
          //   CompanySettingEntity,
          //   this.companySettingService.buildDefaultSettings(companySaved.uid),
          // );

          await transactionalEntityManager.save(InvoiceEntity, firstInvoiceDto);
        },
      );
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  private async encryptPassword(password: string) {
    const salt = await bcrypt.genSalt(saltRounds);
    const encriptedPassoword = await bcrypt.hash(password, salt);
    return encriptedPassoword;
  }
}
