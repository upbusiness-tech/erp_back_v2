import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductCategoryDto } from '../dto/createProductCategory.dto';
import { ProductCategoryEntity } from '../productCategory.entity';

@Injectable()
export class CreateProductCategoryService {
  constructor(
    @InjectRepository(ProductCategoryEntity)
    private repo: Repository<ProductCategoryEntity>,
  ) {}

  async execute(dto: CreateProductCategoryDto, companyUid: string) {
    const productCateogrySaved = await this.repo.save({
      ...dto,
      companyUid,
    });
    return productCateogrySaved;
  }
}
