import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from '../subscription.entity';

@Injectable()
export class SubscriptionDataUiService extends TypeOrmCrudService<SubscriptionEntity> {
  constructor(
    @InjectRepository(SubscriptionEntity) repo: Repository<SubscriptionEntity>,
  ) {
    super(repo);
  }
}
