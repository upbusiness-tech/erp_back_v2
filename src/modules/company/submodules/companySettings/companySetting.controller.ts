import { Crud, CrudController } from '@dataui/crud';
import { Controller, Patch, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { CompanySettingEntity } from './companySetting.entity';
import { CompanySettingService } from './domain/companySetting.service';
import { PermissionsRef } from 'src/modules/permission/const/permissions.ref';
import { CompanyAuthGuard } from 'src/auth/guards/companyAuth.guard';

@Crud({
  model: {
    type: CompanySettingEntity,
  },
})
@Controller('company-setting')
@UseGuards(CompanyAuthGuard)
export class CompanySettingController implements CrudController<CompanySettingEntity> {
  constructor(public service: CompanySettingService) {}

  @Patch('sync')
  @UseGuards(EmployeeAuthGuard, PermissionsGuard)
  @RequirePermission(PermissionsRef.Admin.FullAccess.name)
  async sync() {
    await this.service.sync();
  }
}
