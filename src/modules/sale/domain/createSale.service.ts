import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidOperationException } from 'src/exceptions/invalidOperation.exception';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CashFlowDataUiService } from 'src/modules/cashFlow/domain/cashFlowDataUi.service';
import { CashFlowTransactionEntity } from 'src/modules/cashFlow/submodules/cashFlowTransaction/cashFlowTransaction.entity';
import {
  TransactionOrigin,
  TransactionType,
} from 'src/modules/cashFlow/submodules/cashFlowTransaction/cashFlowTransaction.enum';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { InternCustomerPriceEntity } from 'src/modules/internCustomer/submodules/internCustomerPrice/internCustomerPrice.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { ProductTransactionRecordsEntity } from 'src/modules/product/submodules/productTransaction/productTransactionRecords.entity';
import { ProductTransactionType } from 'src/modules/product/submodules/productTransaction/productTransactionRecords.enum';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { In, Repository } from 'typeorm';
import { CreateSaleDto } from '../dto/createSale.dto';
import { SaleEntity } from '../sale.entity';
import { SaleStatus, SaleType } from '../sale.enum';
import { SaleItemEntity } from '../submodules/saleItem/saleItem.entity';
import { SalePaymentEntity } from '../submodules/salePayment/salePayment.entity';
import { SaleServiceEntity } from '../submodules/saleService/saleService.entity';
import {
  calculateItemLine,
  calculateSaleTotals,
  calculateServiceLine,
} from '../util/saleFormulas';

const CODE_LENGTH = 6;

@Injectable()
export class CreateSaleService {
  constructor(
    @InjectRepository(SaleEntity)
    private repo: Repository<SaleEntity>,
    private readonly companyService: CompanyNestCrudService,
    private readonly userService: UserDataUiService,
    private readonly cashFlowService: CashFlowDataUiService,
  ) {}

  async execute(
    dto: CreateSaleDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      const company = await this.companyService.findActiveCompany(companyUid);

      await this.userService.validateEmployeeUser(employeeUserUid, companyUid);

      await this.cashFlowService.validateOpenCashFlow(
        dto.cashFlowId,
        companyUid,
      );

      let saleSavedToReturn: Partial<SaleEntity>;

      await this.repo.manager.transaction(async (entityManager) => {
        const { items, payments, services, ...saleValues } = dto;

        const saleServices = services ?? [];

        // 1. Load product specifications with products
        const specIds = items.map((i) => i.productEspecificationId);
        const specs = await entityManager.find(ProductEspecificationEntity, {
          where: { id: In(specIds) },
          relations: { product: true },
        });
        const specMap = new Map(specs.map((s) => [s.id, s]));

        for (const item of items) {
          if (!specMap.has(item.productEspecificationId)) {
            throw new ResourceNotFoundException(
              'Variação de produto não encontrada',
            );
          }
        }

        // 2. Load internal customer prices when applicable
        const internPriceIds = items
          .filter((i) => i.isEspecialPrice && i.internCustomerPriceId)
          .map((i) => i.internCustomerPriceId);

        const internPrices =
          internPriceIds.length > 0
            ? await entityManager.find(InternCustomerPriceEntity, {
                where: { id: In(internPriceIds) },
              })
            : [];
        const internPriceMap = new Map(
          internPrices.map((p) => [p.id, p.specialPrice]),
        );

        let saleAmountProfit: number = 0;

        // 3. Build sale items with price and product snapshots
        const saleItems = items.map((item) => {
          const spec = specMap.get(item.productEspecificationId);
          const specialPrice = item.isEspecialPrice
            ? (internPriceMap.get(item.internCustomerPriceId) ?? null)
            : null;

          const productSnapshot: Partial<ProductEspecificationEntity> = {
            ...spec,
          };

          const profit =
            ((specialPrice ? specialPrice : spec.salePrice) - spec.costPrice) *
            item.quantitySold;

          saleAmountProfit += profit;

          return {
            ...item,
            salePriceSnapshot: spec.salePrice,
            specialPriceSnapshot: specialPrice,
            costPriceSnapshot: spec.costPrice ?? null,
            productSnapshot,
          };
        });

        // 4. Build sale services with amount snapshot
        // dont need to save amountSnapshot, it wont change
        // const saleServiceEntities = saleServices.map((service) => ({
        //   ...service,
        //   amountSnapshot: service.amount,
        // }));

        // 5. Validate stock
        for (const item of saleItems) {
          const spec = specMap.get(item.productEspecificationId);
          if (
            spec.isStockControlled &&
            spec.stockQuantity < item.quantitySold
          ) {
            throw new InvalidOperationException(
              `Estoque insuficiente para a varição de produto com ID: ${spec.id}`,
            );
          }
        }

        // 6. Calculate totals and validate financial constraints
        const totals = calculateSaleTotals(
          { discount: saleValues.discount },
          saleItems as SaleItemEntity[],
          saleServices as SaleServiceEntity[],
          payments,
        );

        this.validateSaleFinancials(saleItems, saleServices, totals);

        // 7. Generate sale code
        const [{ lastNumber }] = await entityManager.query(
          `INSERT INTO sale_code_sequence ("companyUid", "lastNumber")
           VALUES ($1, 1)
           ON CONFLICT ("companyUid")
           DO UPDATE SET "lastNumber" = sale_code_sequence."lastNumber" + 1
           RETURNING "lastNumber"`,
          [company.uid],
        );

        // 8. Save sale with totals
        const saleSaved = await entityManager.save(SaleEntity, {
          ...saleValues,
          code: String(lastNumber).padStart(CODE_LENGTH, '0'),
          status: SaleStatus.COMPLETED,
          companyUid: company.uid,
          soldByUserUid: employeeUserUid,
          total: totals.total,
          amountPaid: totals.paid,
          change: totals.change,
          summary: totals.summary,
          amountProfit: saleAmountProfit,
        });

        // 9. Save payments, items and services
        await entityManager.save(
          SalePaymentEntity,
          payments.map((p) => ({ ...p, saleId: saleSaved.id })),
        );

        await entityManager.save(
          SaleItemEntity,
          saleItems.map((i) => ({ ...i, saleId: saleSaved.id })),
        );

        if (saleSaved.type === SaleType.SERVICE && saleServices.length > 0) {
          await entityManager.save(
            SaleServiceEntity,
            saleServices.map((s) => ({ ...s, saleId: saleSaved.id })),
          );
        }

        // 10. Decrement stock atomically and record transaction
        for (const item of saleItems) {
          const spec = specMap.get(item.productEspecificationId);
          if (!spec.isStockControlled) continue;

          const result = await entityManager
            .createQueryBuilder()
            .update(ProductEspecificationEntity)
            .set({
              stockQuantity: () => `stockQuantity - ${item.quantitySold}`,
            })
            .where('id = :id', { id: spec.id })
            .andWhere('stockQuantity >= :qty', { qty: item.quantitySold })
            .execute();

          if (result.affected === 0) {
            throw new BadRequestException(
              `Estoque insuficiente para a Variação de Produto com ID: ${spec.id}`,
            );
          }

          await entityManager.save(ProductTransactionRecordsEntity, {
            type: ProductTransactionType.SUBTRACTION,
            value: item.quantitySold,
            productEspecificationId: spec.id,
            createdByUserUid: employeeUserUid,
            saleId: saleSaved.id,
          });
        }

        // 11. Load saved sale with relations for return
        saleSavedToReturn = await entityManager.findOne(SaleEntity, {
          where: { id: saleSaved.id },
          relations: {
            items: {
              product: true,
              productEspecification: true,
              internCustomerPrice: true,
            },
            payments: true,
            services: true,
            internCustomer: true,
            cashFlow: true,
          },
        });

        // 12. Create cash flow transaction with final total
        await entityManager.save(CashFlowTransactionEntity, {
          origin: TransactionOrigin.SALE,
          saleId: saleSaved.id,
          cashFlowId: dto.cashFlowId,
          amount: totals.total,
          type: TransactionType.INFLOW,
          createdByUserUid: employeeUserUid,
        });
      });

      return saleSavedToReturn;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  private validateSaleFinancials(
    items: Partial<SaleItemEntity>[],
    services: Partial<SaleServiceEntity>[],
    totals: ReturnType<typeof calculateSaleTotals>,
  ) {
    for (const item of items) {
      const { gross, discount } = calculateItemLine(item as SaleItemEntity);
      if (discount > gross) {
        throw new BadRequestException(
          'Desconto do item não pode exceder o valor da linha',
        );
      }
    }

    for (const service of services) {
      const { gross, discount } = calculateServiceLine(
        service as SaleServiceEntity,
      );
      if (discount > gross) {
        throw new BadRequestException(
          'Desconto do serviço não pode exceder o valor do serviço',
        );
      }
    }

    if (totals.saleDiscount > totals.subtotal) {
      throw new BadRequestException(
        'Desconto da venda não pode exceder o subtotal',
      );
    }

    if (totals.paid < totals.total) {
      throw new BadRequestException(
        'Valor pago é insuficiente para o total da venda',
      );
    }

    if (totals.total < 0) {
      throw new BadRequestException('Total da venda não pode ser negativo');
    }
  }
}
