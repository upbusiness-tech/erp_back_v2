import { Controller, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { ProductFiscalClassificationService } from './domain/productFiscalClassification.service';

@Controller('product-fiscal-classification')
@UseGuards(EmployeeAuthGuard)
export class ProductFiscalClassificationController {
  constructor(public service: ProductFiscalClassificationService) {}
}
