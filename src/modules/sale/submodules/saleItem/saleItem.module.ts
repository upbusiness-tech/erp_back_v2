import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaleItemEntity } from './saleItem.entity';
import { SaleItemDataUiService } from './domain/saleItemDataUi.service';
import { SaleItemController } from './saleItem.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SaleItemEntity])],
  controllers: [SaleItemController],
  providers: [SaleItemDataUiService],
  exports: [SaleItemDataUiService],
})
export class SaleItemModule {}
