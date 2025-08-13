import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import {
  CreateMemberDto,
  GetAllMemberFilterDto,
  UpdateMemberDto,
} from './members.dto';

@Injectable()
export class MembersService extends BaseResponse {
  constructor(private prismaService: PrismaService) {
    super();
  }

  async createMember(payload: CreateMemberDto) {
    const foundData = await this.prismaService.teamMembers.findFirst({
      where: {
        user_id: payload.user_id,
        team_id: payload.team_id,
      },
    });

    if (!!foundData)
      throw new HttpException(
        'member already found',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    const joinedMember = await this.prismaService.teamMembers.findFirst({
      where: {
        user_id: payload.user_id,
        status: 'joined',
      },
    });

    if (!!joinedMember)
      throw new HttpException(
        'User is already a member of a team',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    try {
      const data = await this.prismaService.teamMembers.create({
        data: payload,
      });

      return this._success('success create member', data);
    } catch (e) {
      throw new HttpException(
        'failed create member',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listMember(query: GetAllMemberFilterDto) {
    const { keyword, status, page, pageSize, limit } = query;
    const filterQuery: {
      [key: string]: any;
    } = {};

    if (!!keyword) {
      filterQuery.OR = [
        { in_game_id: { contains: keyword } },
        { in_game_name: { contains: keyword } },
        { user: { username: { contains: keyword } } },
        { user: { name: { contains: keyword } } },
      ];
    }

    if (!!status) {
      filterQuery.status = status;
    }

    try {
      const data = await this.prismaService.teamMembers.findMany({
        where: filterQuery,
        take: +pageSize,
        skip: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      });

      const count = await this.prismaService.teamMembers.count({
        where: filterQuery,
      });

      return this._pagination(
        'Members retrieved successfully',
        data,
        count,
        +page,
        +pageSize,
      );
    } catch (error) {
      throw new HttpException(
        'Failed to list members',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDetail(id: number) {
    const data = await this.prismaService.teamMembers.findUnique({
      where: { id },
    });

    if (!data) throw new HttpException('no data found', HttpStatus.NOT_FOUND);

    return this._success('success get detail', data);
  }

  async updateMember(id: number, payload: UpdateMemberDto) {
    const foundData = await this.prismaService.teamMembers.findUnique({
      where: { id },
    });

    if (!foundData)
      throw new HttpException('no data found', HttpStatus.NOT_FOUND);

    try {
      await this.prismaService.teamMembers.update({
        where: foundData,
        data: payload,
      });

      return this._success('success update member');
    } catch (error) {
      throw new HttpException(
        'smth went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteMember(id: number) {
    const foundData = await this.prismaService.teamMembers.findUnique({
      where: { id },
    });

    if (!foundData)
      throw new HttpException('no data found', HttpStatus.NOT_FOUND);

    try {
      await this.prismaService.teamMembers.delete({
        where: foundData,
      });

      return this._success('delete member successfully');
    } catch (error) {
      throw new HttpException(
        'smth went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
