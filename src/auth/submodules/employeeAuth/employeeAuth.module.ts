import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserModule } from 'src/modules/user/user.module';
import { EmployeeAuthService } from './employeeAuth.service';
import { UserDataUiService } from 'src/modules/user/domain/userDataUi.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_EMPLOYEE_SECRET'),
        signOptions: {
          expiresIn: '8h',
        },
      }),
    }),
    UserModule,
  ],
  providers: [EmployeeAuthService, UserDataUiService],
  exports: [EmployeeAuthService],
})
export class EmployeeAuthModule {}
