import { Controller } from '@nestjs/common';
import { Crud, CrudController } from '@dataui/crud';
import { PlanNestCrudService } from './domain/planNestCrud.service';
import { CreatePlanDto } from './dto/createPlan.dto';
import { PlanEntity } from './plan.entity';

@Crud({
  model: {
    type: PlanEntity,
  },
  dto: {
    create: CreatePlanDto,
  },
})
@Controller('plan')
export class PlanController implements CrudController<PlanEntity> {
  constructor(public service: PlanNestCrudService) {}
}
