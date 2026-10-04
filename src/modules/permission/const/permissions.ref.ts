import { AdminPermissions } from './keys/admin.permission';
import { CashFlowPermissions } from './keys/cashflow.permission';
import { CompanyPermissions } from './keys/company.permission';
import { EmployeePermissions } from './keys/employee.permission';
import { InternCustomerPermissions } from './keys/internCustomer.permission';
import { SubscriptionPermissions } from './keys/subscription.permission';
import { ProductPermissions } from './keys/product.permission';
import { ReportPermissions } from './keys/report.permission';
import { SalePermissions } from './keys/sale.permission';
import { SideBarPermissions } from './keys/sidebar.permission';
import { StatsPermissions } from './keys/stats.permission';

export const PermissionsRef = {
  Company: CompanyPermissions,
  Sale: SalePermissions,
  Product: ProductPermissions,
  Employee: EmployeePermissions,
  CashFlow: CashFlowPermissions,
  InternCustomer: InternCustomerPermissions,
  Subscription: SubscriptionPermissions,
  Report: ReportPermissions,
  SideBar: SideBarPermissions,
  Stats: StatsPermissions,
  Admin: AdminPermissions,
};
