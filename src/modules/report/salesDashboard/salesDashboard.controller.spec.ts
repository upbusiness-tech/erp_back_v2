import type { CompanyTokenPayload } from 'src/auth/auth.types';
import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { PERMISSION_KEY } from 'src/common/decorators/require-permission.decorator';
import { Role } from 'src/common/roles';
import { PermissionsRef } from 'src/modules/permission/const/permissions.ref';
import { SalesDashboardController } from './salesDashboard.controller';
import { SalesDashboardService } from './salesDashboard.service';

describe('SalesDashboardController', () => {
  it('protects the route with employee authentication and sales report permission', () => {
    const method = Object.getOwnPropertyDescriptor(
      SalesDashboardController.prototype,
      'getDashboard',
    )?.value;

    expect(Reflect.getMetadata('__guards__', SalesDashboardController)).toEqual(
      expect.arrayContaining([EmployeeAuthGuard, PermissionsGuard]),
    );
    expect(Reflect.getMetadata(PERMISSION_KEY, method as object)).toBe(
      PermissionsRef.Report.ViewSales.name,
    );
  });

  it('passes only the authenticated company to the dashboard service', async () => {
    const getDashboard = jest.fn().mockResolvedValue({});
    const controller = new SalesDashboardController({
      getDashboard,
    } as unknown as SalesDashboardService);
    const query = { from: '2026-01-01', to: '2026-01-31' };

    const company: CompanyTokenPayload = {
      companyUid: 'company-a',
      role: Role.COMPANY,
      plan: 0,
      permissions: [],
    };

    await controller.getDashboard(query, company);

    expect(getDashboard).toHaveBeenCalledWith(query, 'company-a');
  });
});
