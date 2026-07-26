import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyEntity } from '../company.entity';
import { CompanyStatus } from '../company.enum';
import { UpdateCompanyDto } from '../dto/updateCompany.dto';

@Injectable()
export class CompanyNestCrudService extends TypeOrmCrudService<CompanyEntity> {
  constructor(
    @InjectRepository(CompanyEntity) repo: Repository<CompanyEntity>,
  ) {
    super(repo);
  }

  async findActiveCompany(companyUid: string) {
    const company = await this.repo.findOneBy({ uid: companyUid });

    if (!company) {
      throw new BadRequestException('Empresa não encontrada');
    }

    if (company.status !== CompanyStatus.ACTIVE) {
      throw new BadRequestException('Empresa não está com status ativo');
    }

    return company;
  }

  async updateMe(dto: UpdateCompanyDto, companyUid: string) {
    await this.repo.update(
      {
        uid: companyUid,
      },
      dto,
    );
  }
}
