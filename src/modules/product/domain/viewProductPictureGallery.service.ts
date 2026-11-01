import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ViewProductPictureGalleryEntity } from 'src/views/product/viewProductPictureGallery.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ViewProductPictureGalleryService extends TypeOrmCrudService<ViewProductPictureGalleryEntity> {
  constructor(
    @InjectRepository(ViewProductPictureGalleryEntity)
    repo: Repository<ViewProductPictureGalleryEntity>,
  ) {
    super(repo);
  }
}
