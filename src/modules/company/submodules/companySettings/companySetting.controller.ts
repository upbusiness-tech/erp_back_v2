import { Crud, CrudController } from '@dataui/crud';
import { Controller, Patch } from '@nestjs/common';
import { CompanySettingEntity } from './companySetting.entity';
import { CompanySettingService } from './domain/companySetting.service';

@Crud({
  model: {
    type: CompanySettingEntity,
  },
})
@Controller('company-setting')
export class CompanySettingController implements CrudController<CompanySettingEntity> {
  constructor(public service: CompanySettingService) {}

  @Patch('sync')
  async sync() {
    await this.service.sync();
  }
}
