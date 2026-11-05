import { Crud, CrudController } from '@dataui/crud';
import { Controller, Patch, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from 'src/auth/guards/adminAuth.guard';
import { CompanySettingEntity } from './companySetting.entity';
import { CompanySettingService } from './domain/companySetting.service';

@Crud({
  model: {
    type: CompanySettingEntity,
  },
})
@Controller('company-setting')
@UseGuards(AdminAuthGuard)
export class CompanySettingController implements CrudController<CompanySettingEntity> {
  constructor(public service: CompanySettingService) {}

  @Patch('sync')
  async sync() {
    await this.service.sync();
  }
}
