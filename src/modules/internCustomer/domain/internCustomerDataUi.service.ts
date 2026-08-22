import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SaleEntity } from 'src/modules/sale/sale.entity';
import { SaleStatus } from 'src/modules/sale/sale.enum';
import { InternCustomerEntity } from '../internCustomer.entity';

@Injectable()
export class InternCustomerDataUiService extends TypeOrmCrudService<InternCustomerEntity> {
  constructor(
    @InjectRepository(InternCustomerEntity)
    repo: Repository<InternCustomerEntity>,
  ) {
    super(repo);
  }

  async getSalesTotalByCustomer(
    id: number,
    companyUid: string,
  ): Promise<{ salesTotal: number }> {
    const customer = await this.repo.findOne({
      where: { id, companyUid },
      select: { id: true },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const row = await this.repo.manager
      .getRepository(SaleEntity)
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s.total), 0)', 'salesTotal')
      .where('s."internCustomerId" = :id', { id })
      .andWhere('s."deletedAt" IS NULL')
      .andWhere('s.status = :status', { status: SaleStatus.COMPLETED })
      .getRawOne<{ salesTotal: string | number }>();

    return { salesTotal: Number(row?.salesTotal ?? 0) };
  }
}
