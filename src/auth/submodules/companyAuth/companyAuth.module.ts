import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/modules/user/user.entity';
import { UserModule } from 'src/modules/user/user.module';
import { CompanyAuthService } from './companyAuth.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow('JWT_COMPANY_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
    }),
    UserModule,
  ],
  providers: [CompanyAuthService],
  exports: [CompanyAuthService],
})
export class CompanyAuthModule {}
