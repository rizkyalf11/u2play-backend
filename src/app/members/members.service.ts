import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { CreateMemberDto } from './members.dto';

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
            data: payload
        })

        return this._success('success create member', data)
      } catch (e) {
        throw new HttpException('failed create member', HttpStatus.INTERNAL_SERVER_ERROR)
      }
  }
}
