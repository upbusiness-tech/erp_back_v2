import { Crud, CrudController } from '@dataui/crud';
import { Controller } from '@nestjs/common';
import { CompanySettingUsageEntity } from './companySettingUsage.entity';
import { CompanySettingUsageService } from './domain/companySettingUsage.service';

@Crud({
  model: {
    type: CompanySettingUsageEntity,
  },
})
@Controller('company-setting-usage')
export class CompanySettingUsageController implements CrudController<CompanySettingUsageEntity> {
  constructor(public service: CompanySettingUsageService) {}
}
