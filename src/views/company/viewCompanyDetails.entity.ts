import { UserType } from 'src/modules/user/user.enum';
import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_company_details',
  expression: `
  select
    c.uid as "companyUid",
    c.document,
    c."contactPhoneNumber",
    p."name" as "planName",
    c."profilePicture" ,
    c."name",
    c.description ,
    c.address ,
    c."contactEmail" ,
    u.email ,
    c."phoneNumber" 
  from
    companies c
  inner join "plans" p on
    p.id = c."planId" 
  inner join users u on 
    u."companyUid" = c.uid 
  where u."type" = '${UserType.COMPANY}'`,
})
export class ViewCompanyDetailsEntity {
  @ViewColumn()
  companyUid: string;

  @ViewColumn()
  document: string;

  @ViewColumn()
  planName: string;

  @ViewColumn()
  profilePicture: string;

  @ViewColumn()
  name: string;

  @ViewColumn()
  description: string;

  @ViewColumn()
  address: string;

  @ViewColumn()
  contactEmail: string;

  @ViewColumn()
  email: string;

  @ViewColumn()
  phoneNumber: string;

  @ViewColumn()
  contactPhoneNumber: string;
}
