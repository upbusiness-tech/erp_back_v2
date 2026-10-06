import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleServiceEntity } from './saleService.entity';
import { SaleServiceDataUiService } from './domain/saleServiceDataUi.service';

@Module({
  imports: [TypeOrmModule.forFeature([SaleServiceEntity])],
  providers: [SaleServiceDataUiService],
  exports: [SaleServiceDataUiService],
})
export class SaleServiceModule {}
