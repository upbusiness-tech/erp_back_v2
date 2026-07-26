import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViewCompanyDetailsEntity } from 'src/views/company/viewCompanyDetails.entity';

@Injectable()
export class ViewCompanyDetailsService extends TypeOrmCrudService<ViewCompanyDetailsEntity> {
  constructor(
    @InjectRepository(ViewCompanyDetailsEntity)
    repo: Repository<ViewCompanyDetailsEntity>,
  ) {
    super(repo);
  }

  async getMe(companyUid: string) {
    const company = await this.repo.findOneBy({
      companyUid,
    });
    return company;
  }
}
