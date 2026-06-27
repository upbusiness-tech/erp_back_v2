import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import type { CompanyTokenPayload } from './auth.types';
import { CurrentCompany } from './decorators/currentCompany.decorator';
import { LoginCompanyUserDto } from './dto/loginCompanyUser.dto';
import { LoginEmployeeUserDto } from './dto/loginEmployeeUser.dto';
import { CompanyAuthGuard } from './guards/companyAuth.guard';
import { CompanyAuthService } from './submodules/companyAuth/companyAuth.service';
import { EmployeeAuthService } from './submodules/employeeAuth/employeeAuth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly companyAuthService: CompanyAuthService,
    private readonly employeeAuthService: EmployeeAuthService,
  ) {}

  @Post('login/company')
  async loginAsCompany(@Body() dto: LoginCompanyUserDto) {
    return await this.companyAuthService.login(dto);
  }

  @Post('login/employee')
  @UseGuards(CompanyAuthGuard)
  async loginAsEmployee(
    @Body() dto: LoginEmployeeUserDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.employeeAuthService.login(dto, company);
  }
}
