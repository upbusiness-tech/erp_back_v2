import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDataUiService } from './domain/userDataUi.service';
import { UserEntity } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserDataUiService],
  exports: [UserDataUiService],
})
export class UserModule {}
