import type { CrudController, CrudRequest } from '@dataui/crud';
import { Crud, CrudRequestInterceptor, ParsedRequest } from '@dataui/crud';
import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionsRef } from 'src/modules/permission/const/permissions.ref';
import { ViewProductTransactionDetailsEntity } from 'src/views/product/viewProductTransactionDetails.entity';
import { ViewProductTransactionDetailsService } from './domain/viewTopSellingProducts.service';

@Crud({
  model: {
    type: ViewProductTransactionDetailsEntity,
  },
  routes: {
    exclude: [
      'createManyBase',
      'updateOneBase',
      'createManyBase',
      'createOneBase',
      'deleteOneBase',
      'getOneBase',
      'getManyBase',
      'recoverOneBase',
      'replaceOneBase',
      'updateOneBase',
    ],
    deleteOneBase: {
      decorators: [RequirePermission(PermissionsRef.Product.Delete.name)],
    },
  },
})
@Controller('report/product-transaction-dashboard')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class ProductTransactionDashboardController implements CrudController<ViewProductTransactionDetailsEntity> {
  constructor(public service: ViewProductTransactionDetailsService) {}

  @Get('/overview-product-transactions')
  @UseInterceptors(CrudRequestInterceptor)
  @RequirePermission(PermissionsRef.Stats.ViewProductStats.name)
  async getOverviewTransactions(@ParsedRequest() req: CrudRequest) {
    return await this.service.getMany(req);
  }
}
