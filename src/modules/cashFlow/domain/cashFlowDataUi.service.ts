import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidOperationException } from 'src/exceptions/invalidOperation.exception';
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

  async getOpenCash(companyUid: string) {
    const cashFlow = await this.repo.findOne({
      where: {
        companyUid: companyUid,
        isClosed: false,
      },
      relations: {
        openedByUser: {
          employee: true,
        },
        closedByUser: {
          employee: true,
        },
      },
      select: {
        openedByUser: {
          uid: true,
          employee: {
            uid: true,
            name: true,
          },
        },
        closedByUser: {
          uid: true,
          employee: {
            uid: true,
            name: true,
          },
        },
      },
    });

    if (!cashFlow)
      throw new InvalidOperationException(
        'Não existe caixa aberto para a empresa atual!',
      );

    return cashFlow;
  }
}
