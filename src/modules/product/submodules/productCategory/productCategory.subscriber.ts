import { ProductEntity } from 'src/modules/product/product.entity';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  SoftRemoveEvent,
} from 'typeorm';
import { ProductCategoryEntity } from './productCategory.entity';

@EventSubscriber()
export class ProductCategorySubscriber implements EntitySubscriberInterface<ProductCategoryEntity> {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return ProductCategoryEntity;
  }

  async beforeSoftRemove(event: SoftRemoveEvent<ProductCategoryEntity>) {
    await event.manager.update(
      ProductEntity,
      { productCategoryId: event.entity.id },
      { productCategoryId: null },
    );
  }
}
