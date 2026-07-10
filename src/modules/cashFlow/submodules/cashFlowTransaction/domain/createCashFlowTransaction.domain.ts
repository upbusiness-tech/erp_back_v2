import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BusinessException } from 'src/exceptions/business.exception';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { CashFlowDataUiService } from 'src/modules/cashFlow/domain/cashFlowDataUi.service';
import { CreateCashFlowTransactionDto } from '../dto/createCashFlowTransaction.dto';
import { CashFlowTransactionDataUiService } from './cashFlowTransactionDataUi.service';

@Injectable()
export class CreateCashFlowTransactionService {
  constructor(
    private readonly cashFlowTransactionService: CashFlowTransactionDataUiService,
    private readonly cashFlowService: CashFlowDataUiService,
  ) {}

  async execute(
    dto: CreateCashFlowTransactionDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      const cashFlow = await this.cashFlowService.findOne({
        where: {
          companyUid,
          id: dto.cashFlowId,
        },
      });

      if (!cashFlow) throw new ResourceNotFoundException('Caixa');
      if (cashFlow.isClosed)
        throw new BusinessException(
          `O caixa atual está fechado para receber operação de ${dto.type}`,
        );

      return await this.cashFlowTransactionService.save({
        ...dto,
        createdByUserUid: employeeUserUid,
      });
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
