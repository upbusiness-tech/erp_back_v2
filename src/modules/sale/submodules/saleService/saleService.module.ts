import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleServiceEntity } from './saleService.entity';
import { SaleServiceDataUiService } from './domain/saleServiceDataUi.service';
import { SaleServiceController } from './saleService.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SaleServiceEntity])],
  controllers: [SaleServiceController],
  providers: [SaleServiceDataUiService],
  exports: [SaleServiceDataUiService],
})
export class SaleServiceModule {}
