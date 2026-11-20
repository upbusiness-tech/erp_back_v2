/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/modules/product/product.entity';
import { ProductEspecificationEntity } from 'src/modules/product/submodules/productEspecification/productEspecification.entity';
import { ProductTransactionRecordsEntity } from 'src/modules/product/submodules/productTransaction/productTransactionRecords.entity';
import { ProductTransactionType } from 'src/modules/product/submodules/productTransaction/productTransactionRecords.enum';
import { SaleEntity } from 'src/modules/sale/sale.entity';
import { SaleStatus } from 'src/modules/sale/sale.enum';
import { Repository } from 'typeorm';
import { StatisticRepositoryParams } from '../common/statistic.types';
import {
  StatisticStockAlertsAndOpportunitiesRow,
  StatisticStockDistributionByCategoryRow,
  StatisticStockInOutRow,
  StatisticStockStatusByEspecificationRow,
  StatisticStockStatusRow,
  StatisticStockTopSellingProductsRow,
} from './statisticStock.interfaces';
import {
  EOrder,
  QueryStatisticPeriodDto,
} from '../common/dto/queryStatisticPeriod.dto';
@Injectable()
export class StatisticStockRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
    @InjectRepository(ProductEspecificationEntity)
    private readonly productEspecificationRepo: Repository<ProductEspecificationEntity>,
    @InjectRepository(ProductTransactionRecordsEntity)
    private readonly productTransactionRecordsRepo: Repository<ProductTransactionRecordsEntity>,
    @InjectRepository(SaleEntity)
    private readonly saleRepo: Repository<SaleEntity>,
  ) {}

  /**
   * Busca dados de saídas e entradas de produtos do estoque para os cards de:
   * - Entrada (valor em compras no estoque = quanto entrou de produto no estoque)
   * - Saídas (valor em vendas realizadas pelos produtos do estoque = aqui é tratado o valor bruto que foi vendido dos produtos)
   * - Unidades movimentadas (entradas + saídas)
   * - Saldo do período (se entrou mais do que saiu, ou se saiu mais do que entrou)
   */
  async getInOut(params: StatisticRepositoryParams) {
    return await this.productTransactionRecordsRepo
      .createQueryBuilder('ptr')
      .select(
        `SUM(CASE WHEN ptr."type" = :subtraction AND s."status" != :canceled THEN ptr."value" END)`,
        'productExit',
      )
      .addSelect(
        `SUM(CASE WHEN ptr."type" = :subtraction AND s."status" != :canceled THEN si."amountItem" - si."saleDiscountShare" END)`,
        'productExitSaleBalance',
      )
      .addSelect(
        `SUM(CASE WHEN ptr."type" = :plus THEN ptr."value" END)`,
        'productEntry',
      )
      .addSelect(
        `SUM(CASE WHEN ptr."type" = :plus THEN pe."costPrice" * ptr."value" END)`,
        'productEntryBalance',
      )
      .addSelect(
        `SUM(CASE WHEN ptr."type" = :plus THEN ptr."value" ELSE 0 END) +
         SUM(CASE WHEN ptr."type" = :subtraction AND s."status" != :canceled THEN ptr."value" ELSE 0 END)`,
        'productMoviments',
      )
      .addSelect(
        `SUM(CASE WHEN ptr."type" = :plus THEN ptr."value" ELSE 0 END) -
         SUM(CASE WHEN ptr."type" = :subtraction AND s."status" != :canceled THEN ptr."value" ELSE 0 END)`,
        'periodBalance',
      )
      .innerJoin(
        'product_especifications',
        'pe',
        'pe.id = ptr."productEspecificationId"',
      )
      .innerJoin('products', 'p', 'p.id = pe."productId"')
      .leftJoin('sales', 's', 's.id = ptr."saleId"')
      .leftJoin(
        'sales_items',
        'si',
        'si."saleId" = s.id AND si."productEspecificationId" = pe.id',
      )
      .where('p."companyUid" = :companyUid', {
        companyUid: params.companyUid,
      })
      .andWhere('ptr."createdAt" >= :fromDate', {
        fromDate: params.fromDate,
      })
      .andWhere('ptr."createdAt" < :toDate', { toDate: params.toDate })
      .setParameters({
        plus: ProductTransactionType.PLUS,
        subtraction: ProductTransactionType.SUBTRACTION,
        canceled: SaleStatus.CANCELED,
      })
      .getRawOne<StatisticStockInOutRow>();
  }

  /**
   * Busca insiths de saúde do estoque.
   * - Abaixo do estoque mínimo
   * - Acima do estoque máximo
   * - Esgotados
   * - Sem fornecedor informado
   */
  async getAlertsAndOpportunities(companyUid: string) {
    return await this.productEspecificationRepo
      .createQueryBuilder('pe')
      .select(
        `count(case when pe."isStockControlled" = true and pe."stockQuantity" < pe."minStock" then 1 end)`,
        'underMinStock',
      )
      .addSelect(
        `count(case when pe."isStockControlled" = true and pe."stockQuantity" > pe."maxStock" then 1 end)`,
        'overMaxStock',
      )
      .addSelect(
        `count(case when pe."isStockControlled" = true and pe."stockQuantity" = 0 then 1 end)`,
        'soldOutTotal',
      )
      .addSelect(
        `count(case when pe."productSupplierId" is null then 1 end)`,
        'noSupplierInformed',
      )
      .innerJoin('products', 'p', 'p.id = pe."productId"')
      .where('p."companyUid" = :companyUid', { companyUid })
      .getRawOne<StatisticStockAlertsAndOpportunitiesRow>();
  }

  /**
   * Retorna os produtos mais ou menos vendidos baseados pelo ORDER
   */
  async getTopOrUntopSellingProducts(
    params: StatisticRepositoryParams,
    order: 'DESC' | 'ASC' = 'DESC',
  ) {
    const query = this.saleRepo
      .createQueryBuilder('s')
      .select('p."name"', 'name')
      .addSelect('pe."size"', 'size')
      .addSelect('pe."color"', 'color')
      .addSelect('pe."brand"', 'brand')
      .addSelect('p."unitOfMeasure"', 'unitOfMeasure')
      .addSelect('SUM(si."quantitySold" * si."unitSold")', 'quantitySold')
      .addSelect('SUM(si."amountItem" - si."saleDiscountShare")', 'salesAmount')
      .addSelect(
        'SUM(si."amountProfitItem" - si."saleDiscountShare")',
        'salesProfitAmount',
      )
      .innerJoin('sales_items', 'si', 'si."saleId" = s.id')
      .innerJoin(
        'product_especifications',
        'pe',
        'pe.id = si."productEspecificationId"',
      )
      .innerJoin('products', 'p', 'p.id = pe."productId"')
      .where('s."companyUid" = :companyUid', { companyUid: params.companyUid })
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .andWhere('s."status" != :canceledStatus', {
        canceledStatus: SaleStatus.CANCELED,
      })
      .groupBy('p."name"')
      .addGroupBy('pe."size"')
      .addGroupBy('pe."color"')
      .addGroupBy('pe."brand"')
      .addGroupBy('p."unitOfMeasure"')
      .orderBy('"quantitySold"', order);

    if (params.limit) {
      query.limit(params.limit);
    }

    return await query.getRawMany<StatisticStockTopSellingProductsRow>();
  }

  async getRevenueProducts(
    params: StatisticRepositoryParams,
    order: 'DESC' | 'ASC' = 'DESC',
  ) {
    const query = this.saleRepo
      .createQueryBuilder('s')
      .select('p."name"', 'name')
      .addSelect('pe."size"', 'size')
      .addSelect('pe."color"', 'color')
      .addSelect('pe."brand"', 'brand')
      .addSelect('p."unitOfMeasure"', 'unitOfMeasure')
      .addSelect('SUM(si."quantitySold" * si."unitSold")', 'quantitySold')
      .addSelect('SUM(si."amountItem" - si."saleDiscountShare")', 'salesAmount')
      .addSelect(
        'SUM(si."amountProfitItem" - si."saleDiscountShare")',
        'salesProfitAmount',
      )
      .innerJoin('sales_items', 'si', 'si."saleId" = s.id')
      .innerJoin(
        'product_especifications',
        'pe',
        'pe.id = si."productEspecificationId"',
      )
      .innerJoin('products', 'p', 'p.id = pe."productId"')
      .where('s."companyUid" = :companyUid', { companyUid: params.companyUid })
      .andWhere('s."createdAt" >= :fromDate', { fromDate: params.fromDate })
      .andWhere('s."createdAt" < :toDate', { toDate: params.toDate })
      .andWhere('s."status" != :canceledStatus', {
        canceledStatus: SaleStatus.CANCELED,
      })
      .groupBy('p."name"')
      .addGroupBy('pe."size"')
      .addGroupBy('pe."color"')
      .addGroupBy('pe."brand"')
      .addGroupBy('p."unitOfMeasure"')
      .orderBy('"salesProfitAmount"', order);

    if (params.limit) {
      query.limit(params.limit);
    }

    return await query.getRawMany<StatisticStockTopSellingProductsRow>();
  }

  async getDistributionByCategory(companyUid: string) {
    return await this.productRepo
      .createQueryBuilder('p')
      .select('pc.id', 'id')
      .addSelect('pc.name', 'name')
      .addSelect('count(distinct p.id)', 'amountCategory')
      .addSelect('sum(pe."stockQuantity")', 'stockQuantity')
      .innerJoin('product_categories', 'pc', 'pc.id = p."productCategoryId"')
      .innerJoin('product_especifications', 'pe', 'pe."productId" = p.id')
      .where('p."companyUid" = :companyUid', { companyUid })
      .groupBy('pc.id')
      .addGroupBy('pc.name')
      .getRawMany<StatisticStockDistributionByCategoryRow>();
  }

  /**
   * Retorna variações de produtos ordenados pela quantidade em estoque, podendo ser ordenado pela maior quantidade ou pela menor
   * @param companyUid
   * @param params
   * @returns
   */
  async getStockStatusByEspecification(
    companyUid: string,
    params: Pick<QueryStatisticPeriodDto, 'limit' | 'order'> = {
      limit: 5,
      order: EOrder.DESC,
    },
  ) {
    const query = this.productRepo
      .createQueryBuilder('p')
      .select('p."name"', 'name')
      .addSelect('pe."size"', 'size')
      .addSelect('pe."color"', 'color')
      .addSelect('pe."brand"', 'brand')
      .addSelect('p."unitOfMeasure"', 'unitOfMeasure')
      .addSelect('pe."stockQuantity"', 'stockQuantity')
      .innerJoin('product_especifications', 'pe', 'pe."productId" = p.id')
      .where('p."companyUid" = :companyUid', { companyUid })
      .orderBy('pe."stockQuantity"', params.order);

    if (params.limit) {
      query.limit(params.limit);
    }

    return await query.getRawMany<StatisticStockStatusByEspecificationRow>();
  }

  /**
   * Retorna produtos gerais ordenados pela quantidade em estoque, podendo ser ordenado pela maior quantidade ou pela menor
   * @param companyUid
   * @param params
   * @returns
   */
  async getStockStatus(
    companyUid: string,
    params: Pick<QueryStatisticPeriodDto, 'limit' | 'order'> = {
      limit: 5,
      order: EOrder.DESC,
    },
  ) {
    const query = this.productRepo
      .createQueryBuilder('p')
      .select('p."name"', 'name')
      .addSelect('sum(pe."stockQuantity")', 'stockQuantity')
      .addSelect('p."unitOfMeasure"', 'unitOfMeasure')
      .innerJoin('product_especifications', 'pe', 'pe."productId" = p.id')
      .where('p."companyUid" = :companyUid', { companyUid })
      .groupBy('p."name"')
      .addGroupBy('p."unitOfMeasure"')
      .orderBy('"stockQuantity"', params.order);

    if (params.limit) {
      query.limit(params.limit);
    }

    return await query.getRawMany<StatisticStockStatusRow>();
  }
}
