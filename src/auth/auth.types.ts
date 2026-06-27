import { Role } from 'src/common/roles';

export type CompanyTokenPayload = {
  companyUid: string;
  role: Role;
  plan: number;
};

export type EmployeeTokenPayload = {
  uid: string;
  username: string;
  role: Role;
  companyUid: string;
};
