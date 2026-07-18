import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { CompanyAuthGuard } from 'src/auth/guards/companyAuth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { RequirePermission } from 'src/common/decorators/require-permission.decorator';
import { PermissionService } from './domain/permission.service';
import { CurrentCompany } from 'src/auth/decorators/currentCompany.decorator';
import { CurrentUser } from 'src/auth/decorators/currentUser.decorator';
import type { CompanyTokenPayload, UserPayload } from 'src/auth/auth.types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Controller('permissions')
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

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
