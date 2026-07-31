import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { Repository } from 'typeorm';
import { UpdateInvoiceDto } from '../dto/updateInvoice.dto';
import { InvoiceEntity } from '../invoice.entity';
import { InvoiceStatus } from '../invoice.enum';

@Injectable()
export class UpdateInvoiceService {
  constructor(
    @InjectRepository(InvoiceEntity)
    private repo: Repository<InvoiceEntity>,
  ) {}

  async execute(invoiceId: number, dto: UpdateInvoiceDto, companyUid: string) {
    try {
      const invoiceFound = await this.repo.findOne({
        where: { id: invoiceId, companyUid },
      });

      if (!invoiceFound) {
        throw new ResourceNotFoundException('Fatura', invoiceId);
      }

      const paidAt =
        dto.status === InvoiceStatus.PAID && !dto.paidAt
          ? new Date()
          : dto.paidAt;

      await this.repo.update(
        { id: invoiceId },
        {
          ...dto,
          paidAt,
        },
      );

      return await this.repo.findOne({ where: { id: invoiceId } });
    } catch (error: any) {
      if (error instanceof ResourceNotFoundException) throw error;
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
