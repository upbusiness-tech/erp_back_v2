import { Controller, Get, UseGuards } from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { PlanNestCrudService } from './domain/planNestCrud.service';

@Controller('plan')
@UseGuards(EmployeeAuthGuard)
export class PlanController {
  constructor(private readonly planService: PlanNestCrudService) {}

  @Get('me')
  async getMe(@CurrentCompany() company: CompanyTokenPayload) {
    return await this.planService.getCompanyPlan(company.companyUid);
  }
}
