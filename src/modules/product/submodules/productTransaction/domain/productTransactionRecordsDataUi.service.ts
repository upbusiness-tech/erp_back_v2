import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EmployeeTokenPayload } from 'src/auth/auth.types';
import { InvalidOperationException } from 'src/exceptions/invalidOperation.exception';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { Repository } from 'typeorm';
import { ProductEspecificationDataUi } from '../../productEspecification/domain/productEspecificationDataUi.service';
import { ProductEspecificationEntity } from '../../productEspecification/productEspecification.entity';
import { CreateProductTransactionRecordDto } from '../dto/createProductTransactionRecord.dto';
import { ProductTransactionRecordsEntity } from '../productTransactionRecords.entity';
import { ProductTransactionType } from '../productTransactionRecords.enum';

@Injectable()
export class ProductTransactionRecordsDataUiService extends TypeOrmCrudService<ProductTransactionRecordsEntity> {
  constructor(
    @InjectRepository(ProductTransactionRecordsEntity)
    repo: Repository<ProductTransactionRecordsEntity>,
    private readonly productEspecificationDataUiService: ProductEspecificationDataUi,
  ) {
    super(repo);
  }

  async saveTransaction(
    dto: CreateProductTransactionRecordDto,
    employeeUser: EmployeeTokenPayload,
  ) {
    try {
      const pEspecificationFound =
        await this.productEspecificationDataUiService.findOne({
          where: {
            id: dto.productEspecificationId,
          },
        });

      if (!pEspecificationFound)
        throw new ResourceNotFoundException('Product Especification');

      if (!pEspecificationFound.isStockControlled)
        throw new InvalidOperationException(
          'Não é possível atualizar o estoque de um produto que não tem controle de estoque ativado',
        );

      if (
        pEspecificationFound.stockQuantity < dto.value &&
        dto.type === ProductTransactionType.SUBTRACTION
      ) {
        throw new InvalidOperationException(
          'O valor de subtração é maior que o valor atual do estoque',
        );
      }

      await this.repo.manager.transaction(async (entityManager) => {
        await entityManager.save(ProductTransactionRecordsEntity, {
          ...dto,
          createdByUserUid: employeeUser.uid,
        });

        let newStockQuantity = 0;
        if (dto.type === ProductTransactionType.PLUS) {
          newStockQuantity = pEspecificationFound.stockQuantity + dto.value;
        } else {
          console.info('é do tipo subtração então, tá tirando');
          newStockQuantity = pEspecificationFound.stockQuantity - dto.value;
        }
        await entityManager.update(
          ProductEspecificationEntity,
          pEspecificationFound.id,
          {
            stockQuantity: newStockQuantity,
          },
        );
      });
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
