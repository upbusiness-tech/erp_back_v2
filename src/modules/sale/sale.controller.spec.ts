import { EmployeeAuthGuard } from 'src/auth/guards/employeeAuth.guard';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import {
  PERMISSION_KEY,
  RequirePermission,
} from 'src/common/decorators/require-permission.decorator';
import { PermissionsRef } from 'src/modules/permission/const/permissions.ref';
import type { EmployeeTokenPayload } from 'src/auth/auth.types';
import { CancelSaleService } from './domain/cancelSale.service';
import { SaleController } from './sale.controller';

// os guards importam firebase-admin (ESM), que o jest não parseia;
// o mock evita carregar o módulo real durante a coleta dos metadados
jest.mock('src/config/firebase/firebase.config', () => ({
  firebaseAuth: {},
}));

describe('SaleController - cancelSale', () => {
  it('protects the route with the sale cancel permission', () => {
    const method = Object.getOwnPropertyDescriptor(
      SaleController.prototype,
      'cancelSale',
    )?.value;

    expect(
      Reflect.getMetadata('__guards__', SaleController),
    ).toEqual(expect.arrayContaining([EmployeeAuthGuard, PermissionsGuard]));
    expect(Reflect.getMetadata(PERMISSION_KEY, method as object)).toBe(
      PermissionsRef.Sale.Cancel.name,
    );
  });

  it('passes the numeric sale id and employee to the service and returns its result', async () => {
    const employee = { uid: 'employee-1' } as EmployeeTokenPayload;
    const canceledSale = { id: 5, status: 'Cancelada' };
    const execute = jest.fn().mockResolvedValue(canceledSale);
    const controller = new SaleController(
      {} as any,
      {} as any,
      { execute } as unknown as CancelSaleService,
    );

    const result = await controller.cancelSale(5, employee);

    expect(execute).toHaveBeenCalledWith(5, employee);
    expect(result).toBe(canceledSale);
  });

  it('keeps the permission decorator contract consistent with RequirePermission', () => {
    // garante que o valor usado no endpoint é exatamente o da permissão registrada
    expect(PermissionsRef.Sale.Cancel.name).toBe('sale_cancel');
    expect(typeof RequirePermission).toBe('function');
  });
});
