import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { CompanyTokenPayload } from './auth.types';
import { CurrentCompany } from './decorators/currentCompany.decorator';
import { LoginCompanyUserDto } from './dto/loginCompanyUser.dto';
import { LoginEmployeeUserDto } from './dto/loginEmployeeUser.dto';
import { CompanyAuthGuard } from './guards/companyAuth.guard';
import { AdminAuthService } from './submodules/adminAuth/adminAuth.service';
import { EmployeeAuthService } from './submodules/employeeAuth/employeeAuth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly employeeAuthService: EmployeeAuthService,
    private readonly adminAuthService: AdminAuthService,
  ) {}

  @Post('login/employee')
  @UseGuards(CompanyAuthGuard)
  async loginAsEmployee(
    @Body() dto: LoginEmployeeUserDto,
    @CurrentCompany() company: CompanyTokenPayload,
  ) {
    return await this.employeeAuthService.login(dto, company);
  }

  @Get('avaliable-employees')
  @UseGuards(CompanyAuthGuard)
  async avaliableEmployees(@CurrentCompany() company: CompanyTokenPayload) {
    return await this.employeeAuthService.getAvaliableEmployeeUsers(company);
  }

  @Post('login/admin')
  async loginAsAdmin(@Body() dto: LoginCompanyUserDto) {
    return await this.adminAuthService.login(dto);
  }
}
