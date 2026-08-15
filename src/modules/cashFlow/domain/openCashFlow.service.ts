import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessException } from 'src/exceptions/business.exception';
import { InvalidOperationException } from 'src/exceptions/invalidOperation.exception';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { Repository } from 'typeorm';
import { CashFlowEntity } from '../cashFlow.entity';
import { OpenCashFlowDto } from '../dto/openCashFlowEntity.dto';
import { CashFlowDataUiService } from './cashFlowDataUi.service';

const CODE_LENGTH = 6;

@Injectable()
export class OpenCashFlowService {
  constructor(
    @InjectRepository(CashFlowEntity)
    private repo: Repository<CashFlowEntity>,
    private readonly companyService: CompanyNestCrudService,
    private readonly userService: UserDataUiService,
    private readonly cashFlowService: CashFlowDataUiService,
  ) {}

  async execute(
    dto: OpenCashFlowDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      const companyFound = await this.companyService.findOneBy({
        uid: companyUid,
      });

      if (!companyFound) throw new ResourceNotFoundException('Empresa');

      const employeeUserFound = await this.userService.findOne({
        where: {
          uid: employeeUserUid,
          companyUid: companyUid,
        },
        relations: {
          employee: true,
        },
      });

      if (!employeeUserFound)
        throw new ResourceNotFoundException('Usuário funcionário');

      const cashFlowOpened = await this.cashFlowService.findOne({
        where: {
          isClosed: false,
          companyUid,
        },
      });

      if (cashFlowOpened)
        throw new BusinessException(
          'Já existe um caixa aberto para essa empresa!',
        );

      if (!employeeUserFound.employee.isActive)
        throw new InvalidOperationException(
          'Funcionário inativo não pode abrir o caixa',
        );

      await this.repo.manager.transaction(async (entityManager) => {
        const [{ lastNumber }] = await entityManager.query(
          `INSERT INTO cash_flow_code_sequence ("companyUid", "lastNumber")
           VALUES ($1, 1)
           ON CONFLICT ("companyUid")
           DO UPDATE SET "lastNumber" = cash_flow_code_sequence."lastNumber" + 1
           RETURNING "lastNumber"`,
          [companyUid],
        );

        const createCashFlowEntity: Partial<CashFlowEntity> = {
          code: String(lastNumber).padStart(CODE_LENGTH, '0'),
          initialBalance: dto.initialBalance,
          openedByUserUid: employeeUserUid,
          companyUid,
        };

        await entityManager.save(CashFlowEntity, createCashFlowEntity);
      });

      return await this.cashFlowService.getOpenCash(companyUid);
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
