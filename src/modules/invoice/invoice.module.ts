import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceDataUiService } from './domain/invoiceDataUi.service';
import { SendInvoiceProofService } from './domain/sendInvoiceProof.service';
import { UpdateInvoiceService } from './domain/updateInvoice.service';
import { InvoiceController } from './invoice.controller';
import { InvoiceEntity } from './invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntity])],
  controllers: [InvoiceController],
  providers: [
    InvoiceDataUiService,
    SendInvoiceProofService,
    UpdateInvoiceService,
  ],
  exports: [InvoiceDataUiService],
})
export class InvoiceModule {}
