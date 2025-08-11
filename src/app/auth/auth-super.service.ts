import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { CreateUserDto } from './auth.dto';
import { hash } from 'bcrypt';

@Injectable()
export class AuthSuperService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async createUser(payload: CreateUserDto) {
    const found = await this.prismaService.user.findFirst({
      where: { email: payload.email },
    });
    if (!!found)
      throw new HttpException(
        'Email already registered',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    try {
        const password = await hash(payload.password, 10);
      const data = await this.prismaService.user.create({
        data: {
            ...payload,
            password
        },
      });

      return this._success('User created successfully', data);
    } catch (e) {
      throw new HttpException('Failed to create user', 500);
    }
  }

  async getUsers() {
    const data = await this.prismaService.user.findMany();

    return this._success('Users retrieved successfully', data);
  }

  async updateUser(id: number) {
    
  }
}
