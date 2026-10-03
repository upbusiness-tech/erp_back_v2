import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { ProductEntity } from '../../product.entity';
import {
  CsosnEnum,
  OriginEnum,
  PisCofinsCstEnum,
} from './enum/productFiscalClassification.enum';

@Entity({ name: 'product_fiscal_classifications' })
export class ProductFiscalClassificationEntity extends BaseEntity {
  @OneToOne(
    () => ProductEntity,
    (product) => product.productFiscalClassification,
  )
  product: ProductEntity;

  @Column({
    length: 8,
    comment:
      'Nomenclatura Comum do Mercosul (ex: 22030000) - Identifica a natureza do produto',
  })
  ncm: string;

  @Column({
    length: 4,
    comment:
      'Código Fiscal de Operações e Prestações (ex: 5102) - Define a natureza da operação comercial',
  })
  cfop: string;

  @Column({
    type: 'smallint',
    comment:
      'Origem da mercadoria [0-8] (ex: 0) - Indica se o produto é nacional ou importado',
  })
  origin: OriginEnum;

  @Column({
    type: 'varchar',
    length: 3,
    comment:
      'Código de Situação da Operação no Simples Nacional (ex: 102) - Define a tributação do ICMS',
  })
  csosn: CsosnEnum;

  @Column({
    length: 7,
    nullable: true,
    comment:
      'Código Especificador da Substituição Tributária (ex: 0300100) - Identifica produtos sujeitos a ICMS-ST',
  })
  cest?: string;

  @Column({
    type: 'varchar',
    length: 2,
    comment: 'CST do PIS (ex: 01) - Define a situação tributária do PIS',
  })
  pis: PisCofinsCstEnum;

  @Column({
    type: 'varchar',
    length: 2,
    comment: 'CST do COFINS (ex: 49) - Define a situação tributária do COFINS',
  })
  cofins: PisCofinsCstEnum;
}
