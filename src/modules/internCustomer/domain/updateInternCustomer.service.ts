import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { In, Repository } from 'typeorm';
import { CreateInternCustomerDto } from '../dto/createInternCustomer.dto';
import { InternCustomerEntity } from '../internCustomer.entity';
import { InternCustomerPriceEntity } from '../submodules/internCustomerPrice/internCustomerPrice.entity';

@Injectable()
export class UpdateInternCustomerService {
  constructor(
    @InjectRepository(InternCustomerEntity)
    private repo: Repository<InternCustomerEntity>,
    @InjectRepository(InternCustomerPriceEntity)
    private internCustomerPriceRepo: Repository<InternCustomerPriceEntity>,
    private readonly companyService: CompanyNestCrudService,
    private readonly userService: UserDataUiService,
  ) {}

  async execute(
    internCustomerId: number,
    dto: CreateInternCustomerDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      await this.companyService.findActiveCompany(companyUid);

      await this.userService.validateEmployeeUser(employeeUserUid, companyUid);

      const internCustomerFound = await this.repo.findOne({
        where: { id: internCustomerId, companyUid },
      });

      if (!internCustomerFound) {
        throw new ResourceNotFoundException(
          'Cliente interno',
          internCustomerId,
        );
      }

      await this.repo.manager.transaction(async (transactionEntity) => {
        const { internCustomerPrices, ...internCustomerData } = dto;

        await transactionEntity.update(
          InternCustomerEntity,
          { id: internCustomerId },
          {
            ...internCustomerData,
            companyUid,
          },
        );

        const existingPrices = await this.internCustomerPriceRepo.find({
          where: { internCustomerId },
        });

        const incomingIds = internCustomerPrices
          .filter((value) => value.id)
          .map((value) => value.id);

        const toDelete = existingPrices.filter(
          (price) => !incomingIds.includes(price.id),
        );

        if (toDelete.length > 0) {
          await transactionEntity.delete(InternCustomerPriceEntity, {
            id: In(toDelete.map((d) => d.id)),
          });
        }

        if (internCustomerPrices && internCustomerPrices.length > 0) {
          await Promise.all(
            internCustomerPrices.map(async (value) => {
              if (value.id) {
                await transactionEntity.update(
                  InternCustomerPriceEntity,
                  { id: value.id, internCustomerId },
                  {
                    specialPrice: value.specialPrice,
                    productEspecificationId: value.productEspecificationId,
                  },
                );
              } else {
                await transactionEntity.save(InternCustomerPriceEntity, {
                  ...value,
                  internCustomerId,
                });
              }
            }),
          );
        }
      });
    } catch (error: any) {
      if (error instanceof ResourceNotFoundException) throw error;
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
