import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { RegisterDto } from './auth.dto';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(private prismaService: PrismaService) {
    super();
  }
  login() {
    return this._success('success login');
  }

  async register(payload: RegisterDto) {
    const foundData = await this.prismaService.user.findFirst({
      where: {
        provider: 'credential',
        email: payload.email,
      },
    });

    if (foundData) {
      throw new HttpException(
        'Email already registered',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    try {
      const password = await hash(payload.password, 10);
      const data = await this.prismaService.user.create({
        data: {
          ...payload,
          password: password,
          provider: 'credential',
        },
      });

      (BigInt.prototype as any).toJSON = function () {
        return Number(this);
      };

      return this._success('success created account', data);
    } catch (error) {
      throw new HttpException(
        'smth went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
