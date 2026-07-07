import { Crud, CrudController, Override } from '@dataui/crud';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { EmployeeTokenPayload } from 'src/auth/auth.types';
import { CurrentEmployee } from 'src/auth/decorators/currentEmployee.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { ProductTransactionRecordsDataUiService } from './domain/productTransactionRecordsDataUi.service';
import { CreateProductTransactionRecordDto } from './dto/createProductTransactionRecord.dto';
import { ProductTransactionRecordsEntity } from './productTransactionRecords.entity';

@Crud({
  model: {
    type: ProductTransactionRecordsEntity,
  },
  dto: {
    create: CreateProductTransactionRecordDto,
  },
})
@Controller('product-transaction')
@UseGuards(EmployeeAuthGuard)
export class ProductTransactionRecordsController implements CrudController<ProductTransactionRecordsEntity> {
  constructor(public service: ProductTransactionRecordsDataUiService) {}

  @Post()
  @Override('createOneBase')
  async createOne(
    @Body() dto: CreateProductTransactionRecordDto,
    @CurrentEmployee() employee: EmployeeTokenPayload,
  ) {
    return await this.service.saveTransaction(dto, employee);
  }
}
