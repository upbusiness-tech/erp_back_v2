import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { CompanySettingUsageEntity } from './companySettingUsage.entity';
import { CompanySettingUsageService } from './domain/companySettingUsage.service';
import { uidParams } from 'src/consts/uidParams';
import { CompanyAuthGuard } from 'src/auth/guards/companyAuth.guard';

@Crud({
  model: {
    type: CompanySettingUsageEntity,
  },
  query: {
    join: {
      companySetting: {
        eager: true,
      },
    },
  },
  params: {
    uidParams,
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({ companyUid: req.company.companyUid }),
})
@Controller('company-setting-usage')
@UseGuards(CompanyAuthGuard)
export class CompanySettingUsageController implements CrudController<CompanySettingUsageEntity> {
  constructor(public service: CompanySettingUsageService) {}

  @Patch(':id/toggle')
  @UseGuards(EmployeeAuthGuard)
  async toggleActive(@Param('id') id: number) {
    return this.service.toggleActive(id);
  }
}
