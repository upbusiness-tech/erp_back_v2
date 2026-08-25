import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeTokenPayload } from 'src/auth/auth.types';
import { CashFlowTransactionEntity } from 'src/modules/cashFlow/submodules/cashFlowTransaction/cashFlowTransaction.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { ProductTransactionRecordsEntity } from 'src/modules/product/submodules/productTransaction/productTransactionRecords.entity';
import { Repository } from 'typeorm';
import { SaleEntity } from '../sale.entity';
import { SaleStatus } from '../sale.enum';
import { InvalidOperationException } from 'src/exceptions/invalidOperation.exception';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';

@Injectable()
export class CancelSaleService {
  constructor(
    @InjectRepository(SaleEntity)
    private repo: Repository<SaleEntity>,
  ) {}

  async execute(id: number, employee: EmployeeTokenPayload) {
    try {
      const saleToCancel = await this.repo.findOne({
        where: {
          id,
          companyUid: employee.companyUid,
        },
        relations: {
          items: {
            productEspecification: true,
          },
        },
      });

      if (!saleToCancel)
        throw new ResourceNotFoundException('Venda para cancelar');

      // guard de idempotência: não permite cancelar a mesma venda duas vezes
      if (saleToCancel.status === SaleStatus.CANCELED)
        throw new InvalidOperationException('Venda já está cancelada');

      return await this.repo.manager.transaction(async (entityManager) => {
        // 1. marca a venda como cancelada, registrando quando e quem cancelou
        await entityManager.update(SaleEntity, saleToCancel.id, {
          status: SaleStatus.CANCELED,
          canceledAt: new Date(),
          canceledByUserUid: employee.uid,
        });

        // 2. soft delete da transação de entrada no caixa originada pela venda
        await entityManager.softDelete(CashFlowTransactionEntity, {
          saleId: saleToCancel.id,
        });

        // 3. soft delete dos registros de movimentação de estoque da venda
        await entityManager.softDelete(ProductTransactionRecordsEntity, {
          saleId: saleToCancel.id,
        });

        // 4. devolve ao estoque o que foi subtraído na venda
        //    (apenas especificações com controle de estoque ativo)
        for (const item of saleToCancel.items) {
          if (!item.productEspecification?.isStockControlled) continue;

          await entityManager
            .createQueryBuilder()
            .update(ProductEspecificationEntity)
            .set({
              stockQuantity: () => `stockQuantity + (${item.quantitySold} * ${item.unitSold})`,
            })
            .where('id = :id', { id: item.productEspecificationId })
            .execute();
        }

        // 5. retorna a venda atualizada com relações para auditoria
        return await entityManager.findOne(SaleEntity, {
          where: { id: saleToCancel.id },
          relations: {
            items: {
              product: true,
              productEspecification: true,
              internCustomerPrice: true,
            },
            payments: true,
            services: true,
          },
        });
      });
    } catch (error: any) {
      throw new HttpException(
        error?.message ?? 'Erro ao cancelar a venda',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
