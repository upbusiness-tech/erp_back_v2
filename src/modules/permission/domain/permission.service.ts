import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { In, Repository } from 'typeorm';
import { PermissionsRef } from '../const/permissions.ref';
import { PermissionEntity } from '../permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly repo: Repository<PermissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  private async syncPermissions() {
    const permissions: Partial<PermissionEntity>[] = [];

    for (const [moduleName, modulePermissions] of Object.entries(
      PermissionsRef,
    )) {
      for (const permission of Object.values(modulePermissions)) {
        permissions.push({
          module: moduleName,
          key: permission.name,
          title: permission.displayName,
          description: permission.description,
        });
      }
    }

    await this.repo.upsert(permissions, ['key']);
  }

  async findAll(): Promise<PermissionEntity[]> {
    return this.repo.find({ order: { module: 'ASC', key: 'ASC' } });
  }

  async findUserPermissions(userUid: string): Promise<PermissionEntity[]> {
    const user = await this.userRepo.findOne({
      where: { uid: userUid },
      relations: { permissions: true },
    });

    return user?.permissions ?? [];
  }

  async setUserPermissions(
    userUid: string,
    permissionIds: number[],
  ): Promise<PermissionEntity[]> {
    const permissions = await this.repo.findBy({
      id: In(permissionIds),
    });

    await this.userRepo.save({
      uid: userUid,
      permissions,
    });

    return permissions;
  }
}
