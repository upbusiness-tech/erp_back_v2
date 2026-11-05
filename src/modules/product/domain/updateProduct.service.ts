import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { PlanIds } from 'src/modules/plan/plan.enum';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { EntityManager, Repository } from 'typeorm';
import { ProductVariant } from '../dto/createProduct.dto';
import { UpdateProductDto } from '../dto/updateProduct.dto';
import { ProductEntity } from '../product.entity';
import { ProductEspecificationEntity } from '../submodules/productEspecification/productEspecification.entity';
import { ProductFiscalClassificationEntity } from '../submodules/productFiscalClassification/productFiscalClassification.entity';
import { ProductTransactionRecordsEntity } from '../submodules/productTransaction/productTransactionRecords.entity';
import { ProductTransactionType } from '../submodules/productTransaction/productTransactionRecords.enum';

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
    dto: UpdateProductDto,
    companyUid: string,
    employeeUserUid: string,
  ): Promise<ProductEntity | null> {
    try {
      const company = await this.companyService.findActiveCompany(companyUid);

      await this.userService.validateEmployeeUser(employeeUserUid, companyUid);

      const productFound = await this.repo.findOne({
        where: { id: productId, companyUid },
      });

      if (!productFound) throw new ResourceNotFoundException('Product');

      const isDiffMode = dto.idsToDelete !== undefined;

      if (!isDiffMode && !Array.isArray(dto.variants)) {
        throw new HttpException(
          'variants é obrigatório no modo legado',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.repo.manager.transaction(async (transactionEntity) => {
        const {
          variants,
          productFiscalClassification,
          idsToDelete,
          ...productData
        } = dto;
        const variantList = variants ?? [];

        const definedProductData = Object.fromEntries(
          Object.entries(productData).filter(
            ([, value]) => value !== undefined,
          ),
        );

        await transactionEntity.update(
          ProductEntity,
          { id: productId },
          {
            ...definedProductData,
            companyUid,
          },
        );

        if (
          productFiscalClassification &&
          company.planId === PlanIds.FISCAL.valueOf()
        ) {
          if (productFound.productFiscalClassificationId) {
            await transactionEntity.update(
              ProductFiscalClassificationEntity,
              { id: productFound.productFiscalClassificationId },
              productFiscalClassification,
            );
          } else {
            const fiscalSaved = await transactionEntity.save(
              ProductFiscalClassificationEntity,
              productFiscalClassification,
            );

            await transactionEntity.update(
              ProductEntity,
              { id: productId },
              { productFiscalClassificationId: fiscalSaved.id },
            );
          }
        }

        const existingVariants = await this.productEspecificationRepo.find({
          where: { productId },
          withDeleted: !isDiffMode,
        });

        if (isDiffMode) {
          await this.applyDiff(
            transactionEntity,
            productId,
            existingVariants,
            variantList,
            idsToDelete ?? [],
            employeeUserUid,
          );
        } else {
          await this.applyLegacy(
            transactionEntity,
            productId,
            existingVariants,
            variantList,
            employeeUserUid,
          );
        }
      });

      const product = await this.repo.findOne({
        where: { id: productId, companyUid },
        relations: {
          productCategory: true,
          productFiscalClassification: true,
          productEspecifications: {
            productSupplier: true,
          },
          createByUser: {
            employee: true,
          },
        },
      });

      if (product?.productEspecifications) {
        product.productEspecifications = product.productEspecifications.filter(
          (variant) => !variant.deletedAt,
        );
      }

      return product;
    } catch (error: unknown) {
      if (error instanceof ResourceNotFoundException) throw error;
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        error instanceof Error ? error.message : 'Erro ao atualizar produto',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async applyDiff(
    transactionEntity: EntityManager,
    productId: number,
    activeVariants: ProductEspecificationEntity[],
    variants: ProductVariant[],
    idsToDelete: number[],
    employeeUserUid: string,
  ) {
    const activeById = new Map(
      activeVariants.map((variant) => [variant.id, variant]),
    );

    const updates = variants.filter((variant) => variant.id !== undefined);
    const creates = variants.filter((variant) => variant.id === undefined);
    const updateIds = updates.map((variant) => variant.id);

    if (new Set(updateIds).size !== updateIds.length) {
      throw new HttpException(
        'Variações duplicadas no payload',
        HttpStatus.BAD_REQUEST,
      );
    }

    const unknownUpdateIds = updateIds.filter((id) => !activeById.has(id));
    if (unknownUpdateIds.length > 0) {
      throw new HttpException(
        `Variações não pertencem ao produto: ${unknownUpdateIds.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const deleteSet = new Set(idsToDelete);
    const overlap = updateIds.filter((id) => deleteSet.has(id));
    if (overlap.length > 0) {
      throw new HttpException(
        `Ids não podem estar em variants e idsToDelete: ${overlap.join(', ')}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const toDelete = [...deleteSet]
      .map((id) => activeById.get(id))
      .filter((variant): variant is ProductEspecificationEntity => !!variant);

    if (toDelete.length > 0) {
      await transactionEntity.softRemove(ProductEspecificationEntity, toDelete);
    }

    for (const variant of updates) {
      const existing = activeById.get(variant.id);
      const oldStockQuantity = existing.stockQuantity ?? 0;
      const newStockQuantity = variant.stockQuantity ?? oldStockQuantity;
      const stockDiff = newStockQuantity - oldStockQuantity;

      if (stockDiff > 0 && variant.isStockControlled) {
        await transactionEntity.save(ProductTransactionRecordsEntity, {
          type: ProductTransactionType.PLUS,
          value: stockDiff,
          productEspecificationId: variant.id,
          createdByUserUid: employeeUserUid,
        });
      }

      const updateData = Object.fromEntries(
        Object.entries({
          code: variant.code,
          salePrice: variant.salePrice,
          costPrice: variant.costPrice,
          isStockControlled: variant.isStockControlled,
          stockQuantity: newStockQuantity,
          size: variant.size,
          color: variant.color,
          brand: variant.brand,
          barcode: variant.barcode,
          productSupplierId: variant.productSupplierId,
        }).filter(([, value]) => value !== undefined),
      ) as Partial<ProductEspecificationEntity>;

      await transactionEntity.update(
        ProductEspecificationEntity,
        { id: variant.id, productId },
        updateData,
      );
    }

    for (const variant of creates) {
      const newVariant = await transactionEntity.save(
        ProductEspecificationEntity,
        {
          ...variant,
          productId,
        },
      );

      const initialStock = variant.stockQuantity ?? 0;
      if (initialStock > 0 && variant.isStockControlled) {
        await transactionEntity.save(ProductTransactionRecordsEntity, {
          type: ProductTransactionType.PLUS,
          value: initialStock,
          productEspecificationId: newVariant.id,
          createdByUserUid: employeeUserUid,
        });
      }
    }
  }

  private async applyLegacy(
    transactionEntity: EntityManager,
    productId: number,
    existingVariants: ProductEspecificationEntity[],
    variants: ProductVariant[],
    employeeUserUid: string,
  ) {
    const incomingIds = variants
      .filter((variant) => variant.id)
      .map((variant) => variant.id);

    const toDelete = existingVariants.filter(
      (variant) => !incomingIds.includes(variant.id),
    );

    if (toDelete.length > 0) {
      await transactionEntity.softRemove(ProductEspecificationEntity, toDelete);
    }

    for (const variant of variants) {
      if (variant.id) {
        const existing = existingVariants.find(
          (existingVariant) => existingVariant.id === variant.id,
        );

        const oldStockQuantity = existing?.stockQuantity ?? 0;
        const newStockQuantity = variant.stockQuantity ?? oldStockQuantity;
        const stockDiff = newStockQuantity - oldStockQuantity;

        if (stockDiff > 0 && variant.isStockControlled) {
          await transactionEntity.save(ProductTransactionRecordsEntity, {
            type: ProductTransactionType.PLUS,
            value: stockDiff,
            productEspecificationId: variant.id,
            createdByUserUid: employeeUserUid,
          });
        }

        await transactionEntity.update(
          ProductEspecificationEntity,
          { id: variant.id, productId },
          {
            code: variant.code,
            salePrice: variant.salePrice,
            costPrice: variant.costPrice,
            isStockControlled: variant.isStockControlled,
            stockQuantity: newStockQuantity,
            size: variant.size,
            color: variant.color,
            brand: variant.brand,
            barcode: variant.barcode,
            productSupplierId: variant.productSupplierId,
          },
        );
      } else {
        const newVariant = await transactionEntity.save(
          ProductEspecificationEntity,
          {
            ...variant,
            productId,
          },
        );

        const initialStock = variant.stockQuantity ?? 0;
        if (initialStock > 0 && variant.isStockControlled) {
          await transactionEntity.save(ProductTransactionRecordsEntity, {
            type: ProductTransactionType.PLUS,
            value: initialStock,
            productEspecificationId: newVariant.id,
            createdByUserUid: employeeUserUid,
          });
        }
      }
    }
  }
}
