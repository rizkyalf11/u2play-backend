import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { LoginDto, RegisterDto } from './auth.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(private prismaService: PrismaService, private jwtService : JwtService) {
    super();
  }
  generateToken(payload: any, exp: string | number) {
    return this.jwtService.sign(payload, {
      expiresIn: exp,
    });
  }

  async login(payload: LoginDto) {
    const foundData = await this.prismaService.user.findFirst({
      where: {
        provider: 'credential',
        email: payload.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
      }
    });

    if (!foundData) {
      throw new HttpException('Email not registered', HttpStatus.NOT_FOUND);
    }

    const isCorrect = await compare(payload.password, foundData.password);
    (BigInt.prototype as any).toJSON = function () {
        return Number(this);
      };
    if (isCorrect) {
      const { password, ...userData } = foundData;

      const accessToken = this.generateToken(userData, '7d');


      // console.table({
      //   access_token: accessToken,
      //   refresh_token: refreshToken,
      // });


      return this._success('login successful', {
        access_token: accessToken,
      });
    } else {
      throw new HttpException(
        'wrong password',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
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
