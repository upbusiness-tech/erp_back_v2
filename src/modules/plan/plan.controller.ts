import { Crud, CrudController } from '@dataui/crud';
import { Controller, Get, UseGuards } from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { AdminAuthGuard } from 'src/auth/guards/adminAuth.guard';
import { PlanNestCrudService } from './domain/planNestCrud.service';
import { PlanEntity } from './plan.entity';

@Crud({
  model: {
    type: PlanEntity,
  },
  routes: {
    exclude: [
      'createManyBase',
      'updateOneBase',
      'deleteOneBase',
      'replaceOneBase',
    ],
  },
})
@Controller('plan')
@UseGuards(AdminAuthGuard)
export class PlanController implements CrudController<PlanEntity> {
  constructor(public service: PlanNestCrudService) {}

  @Get('me')
  async getMe(@CurrentCompany() company: CompanyTokenPayload) {
    return await this.service.getCompanyPlan(company.companyUid);
  }
}
