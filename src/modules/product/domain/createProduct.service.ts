import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { PlanIds } from 'src/modules/plan/plan.enum';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { UserType } from 'src/modules/user/user.enum';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/createProduct.dto';
import { ProductEntity } from '../product.entity';
import { ProductEspecificationEntity } from '../submodules/productEspecification/productEspecification.entity';
import { ProductFiscalClassificationEntity } from '../submodules/productFiscalClassification/productFiscalClassification.entity';

@Injectable()
export class CreateProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private repo: Repository<ProductEntity>,
    private readonly companyService: CompanyNestCrudService,
    private readonly userService: UserDataUiService,
  ) {}

  async execute(
    dto: CreateProductDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      const companyFound = await this.companyService.findOne({
        where: {
          uid: companyUid,
        },
      });

      if (!companyFound) throw new ResourceNotFoundException('Company');

      const user = await this.userService.findOne({
        where: {
          uid: employeeUserUid,
          companyUid,
          type: UserType.EMPLOYEE,
        },
      });

      if (!user) throw new ResourceNotFoundException('Employee user');

      await this.repo.manager.transaction(async (transactionEntity) => {
        const { variants, productFiscalClassification, ...product } = dto;
        const productSaved = await transactionEntity.save(ProductEntity, {
          ...product,
          companyUid,
          createByUserUid: employeeUserUid,
        });

        if (
          productFiscalClassification &&
          companyFound.planId === PlanIds.FISCAL.valueOf()
        ) {
          const fiscalSaved = await transactionEntity.save(
            ProductFiscalClassificationEntity,
            productFiscalClassification,
          );

          await transactionEntity.update(
            ProductEntity,
            { id: productSaved.id },
            { productFiscalClassificationId: fiscalSaved.id },
          );
        }

        await Promise.all(
          // TODO: é necessário uma estratégia para gerar códigos de produtos quando ele não vier
          variants.map(async (v) => {
            await transactionEntity.save(ProductEspecificationEntity, {
              ...v,
              productId: productSaved.id,
            });
          }),
        );
      });
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
