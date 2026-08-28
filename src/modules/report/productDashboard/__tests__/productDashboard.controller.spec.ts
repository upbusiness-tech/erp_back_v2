import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { PERMISSION_KEY } from 'src/common/decorators/require-permission.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { Role } from 'src/common/roles';
import { PermissionsRef } from 'src/modules/permission/const/permissions.ref';
import { ProductDashboardController } from '../productDashboard.controller';
import { ProductDashboardService } from '../productDashboard.service';

describe('ProductDashboardController', () => {
  it('protects the route with employee authentication and product report permission', () => {
    const method = Object.getOwnPropertyDescriptor(
      ProductDashboardController.prototype,
      'getDashboard',
    )?.value;

    expect(
      Reflect.getMetadata('__guards__', ProductDashboardController),
    ).toEqual(expect.arrayContaining([EmployeeAuthGuard, PermissionsGuard]));
    expect(Reflect.getMetadata(PERMISSION_KEY, method as object)).toBe(
      PermissionsRef.Stats.ViewProductStats.name,
    );
  });

  it('passes only the authenticated company to the dashboard service', async () => {
    const getDashboard = jest.fn().mockResolvedValue({});
    const controller = new ProductDashboardController({
      getDashboard,
    } as unknown as ProductDashboardService);

    await controller.getDashboard(
      { from: '2026-01-01', to: '2026-01-31', limit: 5 },
      {
        companyUid: 'company-a',
        role: Role.COMPANY,
        plan: 0,
        permissions: [],
      },
    );

    expect(getDashboard).toHaveBeenCalledWith(
      { from: '2026-01-01', to: '2026-01-31', limit: 5 },
      'company-a',
    );
  });
});
