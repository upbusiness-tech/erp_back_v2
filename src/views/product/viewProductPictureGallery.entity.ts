import { ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'view_product_picture_gallery',
  expression: `
  select
    min(p.id) as id,
    p."productPicture",
    p."companyUid",
    max(p."createdAt") as "createdAt"
  from products p
  where p."productPicture" is not null
    and p."productPicture" <> ''
  group by p."companyUid", p."productPicture"`,
})
export class ViewProductPictureGalleryEntity {
  @ViewColumn()
  id: number;

  @ViewColumn()
  productPicture: string;

  @ViewColumn()
  companyUid: string;

  @ViewColumn()
  createdAt: string;
}
