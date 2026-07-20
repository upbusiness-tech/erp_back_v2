import { EmployeeType } from 'src/modules/employee/employee.enum';
import { PermissionsRef } from './permissions.ref';

export const EmployeeDefaultPermissions: Record<EmployeeType, string[]> = {
  [EmployeeType.MANAGER]: Object.values(PermissionsRef)
    .flatMap((module) => Object.values(module))
    .filter((p) => !p.isAdminPermission)
    .map((p) => p.name),

  [EmployeeType.CASHIER]: [
    PermissionsRef.Sale.Create.name,
    PermissionsRef.Sale.Read.name,
    PermissionsRef.CashFlow.Open.name,
    PermissionsRef.CashFlow.Close.name,
    PermissionsRef.CashFlow.Read.name,
    PermissionsRef.CashFlow.TransactionCreate.name,
    PermissionsRef.Product.Read.name,
    PermissionsRef.InternCustomer.Read.name,
    PermissionsRef.SideBar.AccessCommonSaleSection.name,
    PermissionsRef.SideBar.AccessServiceSaleSection.name,
    PermissionsRef.SideBar.AccessStockSection.name,
    PermissionsRef.SideBar.AccessCashSection.name,
    PermissionsRef.SideBar.AccessInternClientsSection.name,
    PermissionsRef.SideBar.AccessSettingsSection.name,
  ],

  [EmployeeType.WAITER]: [
    PermissionsRef.Sale.Create.name,
    PermissionsRef.Sale.Read.name,
    PermissionsRef.Product.Read.name,
  ],

  [EmployeeType.DEVELOPER]: Object.values(PermissionsRef)
    .flatMap((module) => Object.values(module))
    .filter((p) => !p.isAdminPermission)
    .map((p) => p.name),
};
