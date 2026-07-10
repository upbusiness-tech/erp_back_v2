import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BusinessException } from 'src/exceptions/business.exception';
import { InvalidOperationException } from 'src/exceptions/invalidOperation.exception';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { EmployeeType } from 'src/modules/employee/employee.enum';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { UserEntity } from 'src/modules/user/user.entity';
import { Repository } from 'typeorm';
import { CashFlowEntity } from '../cashFlow.entity';
import { CloseCashFlowDto } from '../dto/closeCashFlowEntity.dto';
import { CashFlowDataUiService } from './cashFlowDataUi.service';

@Injectable()
export class CloseCashFlowService {
  constructor(
    @InjectRepository(CashFlowEntity)
    private repo: Repository<CashFlowEntity>,
    private readonly companyService: CompanyNestCrudService,
    private readonly userService: UserDataUiService,
    private readonly cashFlowService: CashFlowDataUiService,
  ) {}

  async execute(
    dto: CloseCashFlowDto,
    cashFlowId: number,
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

      const cashFlowOpened = await this.cashFlowService.findOneBy({
        id: cashFlowId,
      });

      if (!cashFlowOpened) throw new ResourceNotFoundException('Caixa');

      if (cashFlowOpened.isClosed)
        throw new BusinessException('Este caixa já foi fechado anteriormente');

      if (!this.canThisEmployeeUserCloseCashFlow(employeeUserFound))
        throw new InvalidOperationException(
          'Usuário não autorizado para abrir o caixa',
        );

      return await this.repo.update(cashFlowId, {
        isClosed: true,
        // FIXME: a data aqui precisa ser gerada pelo próprio postgre, se eu coloco assim ele gera uma data com horário inferior ou superior ao esperado
        closedAt: new Date(),
        closedByUserUid: employeeUserUid,
        closingBalance: dto.closingBalance,
        informedValues: dto.informedValues,
      });
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  // FIXME: será necessário substituir essa lógica para algo mais voltado para permissionamento do funcionário, apesar de que será necessário controlar se o usuário tá ativo ou não
  private canThisEmployeeUserCloseCashFlow(employeeUser: UserEntity) {
    return (
      employeeUser.employee.isActive &&
      employeeUser.employee.type !== EmployeeType.WAITER
    );
  }
}
