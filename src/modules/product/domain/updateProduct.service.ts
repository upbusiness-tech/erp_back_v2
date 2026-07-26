import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/createProduct.dto';
import { ProductEntity } from '../product.entity';
import { ProductEspecificationEntity } from '../submodules/productEspecification/productEspecification.entity';

@Injectable()
export class UpdateProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private repo: Repository<ProductEntity>,
    @InjectRepository(ProductEspecificationEntity)
    private productEspecificationRepo: Repository<ProductEspecificationEntity>,
    private readonly companyService: CompanyNestCrudService,
    private readonly userService: UserDataUiService,
  ) {}

  async execute(
    productId: number,
    dto: CreateProductDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      await this.companyService.findActiveCompany(companyUid);

      await this.userService.validateEmployeeUser(employeeUserUid, companyUid);

      const productFound = await this.repo.findOne({
        where: { id: productId, companyUid },
      });

      if (!productFound) throw new ResourceNotFoundException('Product');

      await this.repo.manager.transaction(async (transactionEntity) => {
        const { variants, ...productData } = dto;

        await transactionEntity.update(
          ProductEntity,
          { id: productId },
          {
            ...productData,
            companyUid,
          },
        );

        const existingVariants = await this.productEspecificationRepo.find({
          where: { productId },
          withDeleted: true,
        });

        const incomingIds = variants
          .filter((v) => v.id)
          .map((v) => v.id as number);

        const toDelete = existingVariants.filter(
          (v) => !incomingIds.includes(v.id),
        );

        if (toDelete.length > 0) {
          await transactionEntity.softRemove(
            ProductEspecificationEntity,
            toDelete,
          );
        }

        await Promise.all(
          variants.map(async (v) => {
            if (v.id) {
              await transactionEntity.update(
                ProductEspecificationEntity,
                { id: v.id, productId },
                {
                  code: v.code,
                  salePrice: v.salePrice,
                  costPrice: v.costPrice,
                  isStockControlled: v.isStockControlled,
                  stockQuantity: v.stockQuantity,
                  size: v.size,
                  color: v.color,
                  brand: v.brand,
                },
              );
            } else {
              await transactionEntity.save(ProductEspecificationEntity, {
                ...v,
                productId,
              });
            }
          }),
        );
      });
    } catch (error: any) {
      if (error instanceof ResourceNotFoundException) throw error;
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
