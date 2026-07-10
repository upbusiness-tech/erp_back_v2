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
import { OpenCashFlowDto } from '../dto/openCashFlowEntity.dto';
import { CashFlowDataUiService } from './cashFlowDataUi.service';

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

      if (!this.canThisEmployeeUserOpenCashFlow(employeeUserFound))
        throw new InvalidOperationException(
          'Usuário não autorizado para abrir o caixa',
        );

      const createCashFlowEntity: Partial<CashFlowEntity> = {
        initialBalance: dto.initialBalance,
        openedByUserUid: employeeUserUid,
        companyUid,
      };

      return await this.repo.save(createCashFlowEntity);
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  // FIXME: será necessário substituir essa lógica para algo mais voltado para permissionamento do funcionário, apesar de que será necessário controlar se o usuário tá ativo ou não
  private canThisEmployeeUserOpenCashFlow(employeeUser: UserEntity) {
    return (
      employeeUser.employee.isActive &&
      employeeUser.employee.type !== EmployeeType.WAITER
    );
  }
}
