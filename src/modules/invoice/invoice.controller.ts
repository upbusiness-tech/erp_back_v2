import { Crud, CrudAuth, CrudController, Override } from '@dataui/crud';
import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PermissionsRef } from '../permission/const/permissions.ref';
import { InvoiceDataUiService } from './domain/invoiceDataUi.service';
import { SendInvoiceProofService } from './domain/sendInvoiceProof.service';
import { UpdateInvoiceService } from './domain/updateInvoice.service';
import { CreateInvoiceDto } from './dto/createInvoice.dto';
import { SendInvoiceProofDto } from './dto/sendInvoiceProof.dto';
import { UpdateInvoiceDto } from './dto/updateInvoice.dto';
import { InvoiceEntity } from './invoice.entity';

@Crud({
  model: {
    type: InvoiceEntity,
  },
  dto: {
    create: CreateInvoiceDto,
    update: UpdateInvoiceDto,
  },
  routes: {
    exclude: ['createManyBase', 'deleteOneBase'],
    createOneBase: {
      decorators: [RequirePermission(PermissionsRef.Invoice.Create.name)],
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
@Controller('invoice')
@UseGuards(EmployeeAuthGuard, PermissionsGuard)
export class InvoiceController implements CrudController<InvoiceEntity> {
  constructor(
    public service: InvoiceDataUiService,
    private readonly sendInvoiceProofService: SendInvoiceProofService,
    private readonly updateInvoiceService: UpdateInvoiceService,
  ) {}

  @Post(':id/send-proof')
  @RequirePermission(PermissionsRef.Invoice.SendProof.name)
  async sendProof(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SendInvoiceProofDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.sendInvoiceProofService.execute(
      id,
      dto,
      company.companyUid,
    );
  }

  @Patch(':id')
  @Override('updateOneBase')
  @RequirePermission(PermissionsRef.Invoice.Update.name)
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInvoiceDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.updateInvoiceService.execute(id, dto, company.companyUid);
  }
}
