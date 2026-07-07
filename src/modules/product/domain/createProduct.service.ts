import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from '../dto/createProduct.dto';
import { ProductEntity } from '../product.entity';
import { ProductEspecificationEntity } from '../submodules/productEspecification/productEspecification.entity';
import { CompanyNestCrudService } from 'src/modules/company/domain/companyNestCrud.service';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';
import { ResourceNotFoundException } from 'src/exceptions/notFound.exception';
import { UserType } from 'src/modules/user/user.enum';

@Injectable()
export class CreateProductService {
  constructor(
    @InjectRepository(ProductEntity)
    private repo: Repository<ProductEntity>,
    private readonly companyService: CompanyNestCrudService,
    private readonly userService: UserDataUiService,
  ) {}

  async execute(
    dto: CreateProductDto,
    companyUid: string,
    employeeUserUid: string,
  ) {
    try {
      const companyFound = await this.companyService.findOne({
        where: {
          uid: companyUid,
        },
      });

      if (!companyFound) throw new ResourceNotFoundException('Company');

      const user = await this.userService.findOne({
        where: {
          uid: employeeUserUid,
          companyUid,
          type: UserType.EMPLOYEE,
        },
      });

      if (!user) throw new ResourceNotFoundException('Employee user');
      await this.repo.manager.transaction(async (transactionEntity) => {
        const { variants, ...product } = dto;
        const productSaved = await transactionEntity.save(ProductEntity, {
          ...product,
          companyUid,
          createByUserUid: employeeUserUid,
        });

        await Promise.all(
          // TODO: é necessário uma estratégia para gerar códigos de produtos quando ele não vier
          variants.map(async (v) => {
            await transactionEntity.save(ProductEspecificationEntity, {
              ...v,
              productId: productSaved.id,
            });
          }),
        );
      });
    } catch (error: any) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
