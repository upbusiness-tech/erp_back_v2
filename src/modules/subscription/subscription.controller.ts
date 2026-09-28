import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { Controller, UseGuards } from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionsRef } from '../permission/const/permissions.ref';
import { SubscriptionDataUiService } from './domain/subscriptionDataUi.service';
import { CreateSubscriptionDto } from './dto/createSubscription.dto';
import { SubscriptionEntity } from './subscription.entity';

@Crud({
  model: {
    type: SubscriptionEntity,
  },
  dto: {
    create: CreateSubscriptionDto,
  },
  routes: {
    exclude: ['createManyBase', 'deleteOneBase'],
    createOneBase: {
      decorators: [RequirePermission(PermissionsRef.Subscription.Create.name)],
    },
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
  constructor(public service: SubscriptionDataUiService) {}
}
