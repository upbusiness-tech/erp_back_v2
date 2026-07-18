import { AdminPermissions } from './keys/admin.permission';
import { CashFlowPermissions } from './keys/cashflow.permission';
import { CompanyPermissions } from './keys/company.permission';
import { EmployeePermissions } from './keys/employee.permission';
import { InternCustomerPermissions } from './keys/internCustomer.permission';
import { ProductPermissions } from './keys/product.permission';
import { ReportPermissions } from './keys/report.permission';
import { SalePermissions } from './keys/sale.permission';

export const PermissionsRef = {
  Company: CompanyPermissions,
  Sale: SalePermissions,
  Product: ProductPermissions,
  Employee: EmployeePermissions,
  CashFlow: CashFlowPermissions,
  InternCustomer: InternCustomerPermissions,
  Report: ReportPermissions,
  Admin: AdminPermissions,
};
