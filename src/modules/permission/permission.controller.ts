import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { CompanyTokenPayload, UserPayload } from 'src/auth/auth.types';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import { CompanyAuthGuard } from 'src/auth/guards/companyAuth.guard';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Repository } from 'typeorm';
import { EmployeeType } from '../employee/employee.enum';
import { UserEntity } from '../user/user.entity';
import { PermissionService } from './domain/permission.service';

@Controller('permissions')
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  @Patch('sync')
  @RequirePermission('admin_full_acess')
  async sync() {
    await this.permissionService.syncPermissions();
  }

  @Get('avaliable-permissions')
  async getAvaliablePermissions(
    @Query('employeeType') employeeType: EmployeeType,
  ) {
    return await this.permissionService.findEmployeeDefaultPermissions(
      employeeType,
    );
  }

  @Get()
  @UseGuards(EmployeeAuthGuard, PermissionsGuard)
  @RequirePermission('admin_full_access')
  async listAll() {
    return this.permissionService.findAll();
  }

  @Get('user/:userUid')
  @UseGuards(CompanyAuthGuard)
  async getUserPermissions(
    @Param('userUid') userUid: string,
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentUser() user: UserPayload,
  ) {
    if (!user.isAdmin) {
      await this.ensureUserBelongsToCompany(userUid, company.companyUid);
    }
    return this.permissionService.findUserPermissions(userUid);
  }

  @Put('user/:userUid')
  @UseGuards(CompanyAuthGuard)
  async setUserPermissions(
    @Param('userUid') userUid: string,
    @Body() body: { permissions: number[] },
    @CurrentCompany() company: CompanyTokenPayload,
    @CurrentUser() user: UserPayload,
  ) {
    if (!user.isAdmin) {
      await this.ensureUserBelongsToCompany(userUid, company.companyUid);
    }
    return this.permissionService.setUserPermissions(userUid, body.permissions);
  }

  private async ensureUserBelongsToCompany(
    userUid: string,
    companyUid: string,
  ) {
    const targetUser = await this.userRepo.findOneBy({ uid: userUid });
    if (!targetUser || targetUser.companyUid !== companyUid) {
      throw new ForbiddenException('Usuário não pertence à sua empresa');
    }
  }
}
