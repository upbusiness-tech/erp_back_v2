import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InvalidOperationException } from 'src/exceptions/invalidOperation.exception';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { Repository } from 'typeorm';
import { SendInvoiceProofDto } from '../dto/sendInvoiceProof.dto';
import { InvoiceEntity } from '../invoice.entity';
import { InvoiceStatus } from '../invoice.enum';

@Injectable()
export class SendInvoiceProofService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private repo: Repository<InvoiceEntity>,
  ) {}

  async execute(
    invoiceId: number,
    dto: SendInvoiceProofDto,
    companyUid: string,
  ) {
    try {
      const invoiceFound = await this.repo.findOne({
        where: { id: invoiceId, companyUid },
      });

      if (!invoiceFound) {
        throw new ResourceNotFoundException('Fatura', invoiceId);
      }

      if (
        invoiceFound.status === InvoiceStatus.PAID ||
        invoiceFound.status === InvoiceStatus.ANALISYS
      ) {
        throw new InvalidOperationException(
          'Status da fatura não permite envio de comprovante',
        );
      }

      await this.repo.update(
        { id: invoiceId },
        {
          paymentProofUrl: dto.paymentProofUrl,
          status: InvoiceStatus.ANALISYS,
        },
      );

      return await this.repo.findOne({ where: { id: invoiceId } });
    } catch (error: any) {
      if (
        error instanceof ResourceNotFoundException ||
        error instanceof InvalidOperationException
      ) {
        throw error;
      }
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
