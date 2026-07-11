import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user.entity';
import { UserType } from '../user.enum';

@Injectable()
export class UserDataUiService extends TypeOrmCrudService<UserEntity> {
  constructor(@InjectRepository(UserEntity) repo: Repository<UserEntity>) {
    super(repo);
  }

  async validateEmployeeUser(userUid: string, companyUid: string) {
    const user = await this.repo.findOne({
      where: { uid: userUid },
      relations: { employee: true },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.type !== UserType.EMPLOYEE) {
      throw new BadRequestException('Usuário não é do tipo Funcionário');
    }

    if (!user.employee) {
      throw new BadRequestException('Funcionário não encontrado');
    }

    if (!user.employee.isActive) {
      throw new BadRequestException('Funcionário está inativo');
    }

    if (user.employee.companyUid !== companyUid) {
      throw new BadRequestException('Funcionário não pertence a esta empresa');
    }

    return user.employee;
  }
}
