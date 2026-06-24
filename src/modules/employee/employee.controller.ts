import { Crud, CrudController } from '@dataui/crud';
import { Controller } from '@nestjs/common';
import { EmployeeDataUiService } from './domain/employeeDataUi.service';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { EmployeeEntity } from './employee.entity';
import { uidParams } from 'src/consts/uidParams';

@Crud({
  model: {
    type: EmployeeEntity,
  },
  dto: {
    create: CreateEmployeeDto,
  },
  params: {
    uidParams,
  },
})
@Controller('employee')
export class EmployeeController implements CrudController<EmployeeEntity> {
  constructor(public service: EmployeeDataUiService) {}
}
