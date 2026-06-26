import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CompanyUserEntity } from '../companyUser.entity';
import { CreateCompanyUserDto } from '../dto/createCompanyUser.dto';
import { saltRounds } from 'src/consts/bcrypt';

@Injectable()
export class CreateCompanyUserService {
  constructor(
    @InjectRepository(CompanyUserEntity)
    private readonly repo: Repository<CompanyUserEntity>,
  ) {}

  async execute(dto: CreateCompanyUserDto) {
    const salt = await bcrypt.genSalt(saltRounds);
    const encriptedPassoword = await bcrypt.hash(dto.password, salt);
    await this.repo.save({
      ...dto,
      password: encriptedPassoword,
    });
  }
}
