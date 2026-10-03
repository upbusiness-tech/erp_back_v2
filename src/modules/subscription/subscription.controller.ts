import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { Controller, Param, Post, UseGuards } from '@nestjs/common';
import { CreateSubscriptionWithMPService } from './domain/createSubscriptionWithMP.service';
import { SubscriptionDataUiService } from './domain/subscriptionDataUi.service';
import { CreateSubscriptionDto } from './dto/createSubscription.dto';
import { SubscriptionEntity } from './subscription.entity';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';

@Crud({
  model: {
    type: SubscriptionEntity,
  },
  dto: {
    create: CreateSubscriptionDto,
  },
  routes: {
    exclude: ['createManyBase', 'deleteOneBase'],
  },
  query: {
    softDelete: true,
  },
})
@CrudAuth({
  filter: (req) => ({ companyUid: req.company.companyUid }),
  persist: (req) => ({ companyUid: req.company.companyUid }),
})
@Controller('subscription')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class SubscriptionController implements CrudController<SubscriptionEntity> {
  constructor(
    public service: SubscriptionDataUiService,
    private readonly createSubscriptionWithMPService: CreateSubscriptionWithMPService,
  ) {}

  @Post(':uid')
  async createByCompany(@Param('uid') uid: string) {
    return await this.createSubscriptionWithMPService.execute(uid);
  }
}
