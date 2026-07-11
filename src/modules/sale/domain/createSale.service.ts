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
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
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

      await this.repo.manager.transaction(async (entityManager) => {
        const { items, payments, services, ...saleValues } = dto;

        const saleSaved = await entityManager.save(SaleEntity, {
          ...saleValues,
          code: Math.random().toString(),
          status: SaleStatus.COMPLETED,
          companyUid: company.uid,
          soldByUserUid: employeeUserUid,
        });

        await entityManager.save(
          SalePaymentEntity,
          payments.map((p) => ({ ...p, saleId: saleSaved.id })),
        );

        await entityManager.save(
          SaleItemEntity,
          items.map((i) => ({ ...i, saleId: saleSaved.id })),
        );

        if (saleSaved.type === SaleType.SERVICE && services.length > 0) {
          await entityManager.save(
            SaleServiceEntity,
            services.map((s) => ({ ...s, saleId: saleSaved.id })),
          );
        }

        // 1. carregar todos os ids de todos os itens
        const specIds = items.map((i) => i.productEspecificationId);

        // 2. carregando todos os itens que estão sendo vendidos
        const specs = await entityManager.find(ProductEspecificationEntity, {
          where: {
            id: In(specIds),
          },
        });
        const specMap = new Map(specs.map((s) => [s.id, s]));

        // 3. validar estoque
        for (const item of items) {
          const spec = specMap.get(item.productEspecificationId);
          if (!spec)
            throw new ResourceNotFoundException(
              'Variação de produto não encontrada',
            );
          if (
            spec.isStockControlled &&
            spec.stockQuantity < item.quantitySold
          ) {
            throw new InvalidOperationException(
              `Estoque insuficiente para a varição de produto com ID: ${spec.id}`,
            );
          }
        }

        // 4. decrementar com update atômico + registrar movimentação
        for (const item of items) {
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
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
