import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { Repository } from 'typeorm';
import { CreateInternCustomerDto } from '../dto/createInternCustomer.dto';
import { InternCustomerEntity } from '../internCustomer.entity';
import { InternCustomerPriceEntity } from '../submodules/internCustomerPrice/internCustomerPrice.entity';

@Injectable()
export class CreateInternCustomerService {
  constructor(
    @InjectRepository(InternCustomerEntity)
    private repo: Repository<InternCustomerEntity>,
    private readonly companyService: CompanyNestCrudService,
    private readonly userService: UserDataUiService,
  ) {}

  async execute(
    dto: CreateInternCustomerDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      await this.companyService.findActiveCompany(companyUid);

      await this.userService.validateEmployeeUser(employeeUserUid, companyUid);

      await this.repo.manager.transaction(async (transactionEntity) => {
        const { internCustomerPrices, ...internCustomer } = dto;

        const internCustomerSaved = await transactionEntity.save(
          InternCustomerEntity,
          {
            ...internCustomer,
            companyUid,
          },
        );

        if (internCustomerPrices && internCustomerPrices.length > 0) {
          await Promise.all(
            internCustomerPrices.map(async (value) => {
              await transactionEntity.save(InternCustomerPriceEntity, {
                ...value,
                internCustomerId: internCustomerSaved.id,
              });
            }),
          );
        }
      });
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
