import { Module } from '@nestjs/common';
import { InvoiceEntity } from './invoice.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({ imports: [TypeOrmModule.forFeature([InvoiceEntity])] })
export class InvoiceModule {}
