import { Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalePaymentEntity } from '../salePayment.entity';

@Injectable()
export class SalePaymentDataUiService extends TypeOrmCrudService<SalePaymentEntity> {
  constructor(
    @InjectRepository(SalePaymentEntity) repo: Repository<SalePaymentEntity>,
  ) {
    super(repo);
  }
}
