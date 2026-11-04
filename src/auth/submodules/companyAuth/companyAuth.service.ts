import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyTokenPayload } from 'src/auth/auth.types';
import { LoginCompanyUserDto } from 'src/auth/dto/loginCompanyUser.dto';
import { Role } from 'src/common/roles';
import { firebaseAuth } from 'src/config/firebase/firebase.config';
import { PlanIds } from 'src/modules/plan/plan.enum';

@Injectable()
export class CompanyAuthService {
  constructor() {}

  async registerOnFirebase(
    payload: LoginCompanyUserDto,
    companyCreatedUid: string,
  ) {
    try {
      const userRecord = await firebaseAuth.createUser({
        email: payload.email,
        password: payload.password,
      });

      const claims: CompanyTokenPayload = {
        companyUid: companyCreatedUid,
        role: Role.COMPANY,
        permissions: [],
        plan: PlanIds.GESTOR,
      };

      await firebaseAuth.setCustomUserClaims(userRecord.uid, { ...claims });

      return userRecord;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
