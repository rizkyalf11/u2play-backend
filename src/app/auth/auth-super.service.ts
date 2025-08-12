import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { CreateUserDto, GetUserFilterDto, UpdateUserDto } from './auth.dto';
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

  async getUsers(query: GetUserFilterDto) {
    const {page, pageSize, limit, keyword} = query;
    const filterQuery: {
      [key: string]: any;
    } = {};

    if (!!keyword) filterQuery.OR = [
          { username: { contains: keyword  } },
          { email: { contains: keyword } },
          {name: { contains: keyword } },
        ]
    const data = await this.prismaService.user.findMany({
      take: +pageSize,
      skip: limit,
      where: filterQuery
    });
    const count = await this.prismaService.user.count({where: filterQuery});

    const data2 = data.map((dt) => {
      const { password, ...rest } = dt;
      return rest;
    })

    return this._pagination('Users retrieved successfully', data2, count, +page, +pageSize);
  }

  async updateUser(id: number, payload: UpdateUserDto) {
    const foundData = await this.prismaService.user.findUnique({
      where: { id },
    })

    if (!foundData)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const useEmail = await this.prismaService.user.count({
      where: {
        id: { not: id },
        email: payload.email,
      }
    })

    if (useEmail > 0)
      throw new HttpException('Email already registered', HttpStatus.UNPROCESSABLE_ENTITY);

    try {
      await this.prismaService.user.update({
      where: foundData,
      data: payload,
    })
    } catch (e) {
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return this._success('User updated successfully');
  }

  async detailUser(id: number) {
    const foundData = await this.prismaService.user.findUnique({
      where: { id },
    })

    if (!foundData)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const { password, ...rest } = foundData;

    return this._success('User details retrieved successfully', rest);
  }
  async deleteUser(id: number) {
    const foundData = await this.prismaService.user.findUnique({
      where: { id },
    })

    if (!foundData)
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    await this.prismaService.user.delete({where: foundData})

    return this._success('User deleted successfully');
  }
}
