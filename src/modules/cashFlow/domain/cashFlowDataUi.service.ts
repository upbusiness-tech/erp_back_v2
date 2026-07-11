import { BadRequestException, Injectable } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashFlowEntity } from '../cashFlow.entity';

@Injectable()
export class CashFlowDataUiService extends TypeOrmCrudService<CashFlowEntity> {
  constructor(
    @InjectRepository(CashFlowEntity) repo: Repository<CashFlowEntity>,
  ) {
    super(repo);
  }

  async validateOpenCashFlow(cashFlowId: number, companyUid: string) {
    const cashFlow = await this.repo.findOneBy({ id: cashFlowId });

    if (!cashFlow) {
      throw new BadRequestException('Caixa não encontrado');
    }

    if (cashFlow.isClosed) {
      throw new BadRequestException('Caixa já está fechado');
    }

    if (cashFlow.companyUid !== companyUid) {
      throw new BadRequestException('Caixa não pertence a esta empresa');
    }

    return cashFlow;
  }
}
