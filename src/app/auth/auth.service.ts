import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import {
  ForgetPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from './auth.dto';
import { hash, compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { REQUEST } from '@nestjs/core';
import { randomBytes } from 'crypto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private mailService: EmailService,
    @Inject(REQUEST) private req: any,
  ) {
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
      },
    });

    if (!foundData) {
      throw new HttpException('Email not registered', HttpStatus.NOT_FOUND);
    }

    const isCorrect = await compare(payload.password, foundData?.password);
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
        OR: [
          {email: payload.email},

          {username: payload.username}
        ]
      },
    });

    if (foundData) {
      throw new HttpException(
        'Email or username already registered',
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

  async getProfile() {
    const id = this.req.user.id;
    const data = await this.prismaService.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        bio: true,
        nik: true,
        role: true,
        // avatar: true,
        TeamMembers: {
          select: {
            id: true,
            role: true,
            status: true,
            team: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },

    });

    const currentTeam = await this.prismaService.teams.findFirst({
      where: {
        TeamMembers: {
          some: {
            user_id: this.req.user.id,
            status: 'joined'
          }
        }
      }
    })

    if (!data) throw new HttpException('user not found', HttpStatus.NOT_FOUND);

    return this._success('success get profile', {...data, currentTeam});
  }

  async forgetPassword(payload: ForgetPasswordDto) {
    const data = await this.prismaService.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (!data) {
      throw new HttpException('Email not registered', HttpStatus.NOT_FOUND);
    }

    const token = randomBytes(32).toString('hex');
    const link = `http://localhost:${process.env.APP_PORT}/auth/reset-password/${data.id}/${token}`;

    try {
      await this.mailService.sendEmail({
        email: data.email,
        username: data.username,
        link: link,
      });

      await this.prismaService.resetPassword.create({
        data: {
          userId: data.id,
          token: token,
        },
      });

      return this._success('Silahkan Cek Email');
    } catch (error) {
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resetPassword(
    userID: number,
    token: string,
    payload: ResetPasswordDto,
  ) {
    const data = await this.prismaService.resetPassword.findFirst({
      where: {
        userId: userID,
        token: token,
      },
    });

    if (!data) {
      throw new HttpException('Invalid token', HttpStatus.NOT_FOUND);
    }

    try {
      const password = await hash(payload.password, 10);
      await this.prismaService.user.update({
        where: {
          id: data.userId,
        },
        data: {
          password: password,
        },
      });

      await this.prismaService.resetPassword.delete({
        where: data,
      });
      return this._success('Change password succeccful!');
    } catch (error) {
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
