import { Role } from 'src/common/roles';

export type CompanyTokenPayload = {
  companyUid: string;
  role: Role;
  plan: number;
  permissions: string[];
};

export type EmployeeTokenPayload = {
  uid: string;
  username: string;
  role: Role;
  companyUid: string;
  permissions: string[];
};

export type AdminTokenPayload = {
  uid: string;
  email: string;
  role: Role;
  isAdmin: true;
  permissions: string[];
};

export type UserPayload = {
  uid: string;
  role: Role;
  companyUid?: string;
  permissions: string[];
  isAdmin?: boolean;
};
