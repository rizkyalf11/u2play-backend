import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import {
  AcceptInvitationDto,
  CreateTeamDto,
  GetAllTeamsDto,
  InviteTeamDto,
  TeamMembersFilterDto,
  UpdateTeamDto,
  UpdateTeamMember,
} from './team.dto';
import { REQUEST } from '@nestjs/core';
import { filter } from 'rxjs';

@Injectable()
export class TeamService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async createTeam(payload: CreateTeamDto) {
    if (this.req.user.role != 'super_admin') {
      const findMember = await this.prismaService.teamMembers.findFirst({
        where: {
          user_id: this.req.user.id,
          status: {
            in: ['joined'],
          },
        },
      });

      if (!!findMember) {
        throw new HttpException(
          'You are already a member of a team',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
    try {
      let data;
      if (this.req.user.role == 'super_admin') {
        data = await this.prismaService.teams.create({
          data: {
            ...payload,
          },
        });
      } else {
        data = await this.prismaService.teams.create({
          data: {
            ...payload,
            TeamMembers: {
              create: {
                user_id: this.req.user.id,
                status: 'joined',
                role: 'captain',
                joined_at: new Date(),
              },
            },
          },
          include: {
            TeamMembers: true,
          },
        });
      }

      return this._success('Team created successfully', data);
    } catch (error) {
      throw new HttpException(
        'Failed to create team',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllTeams(query: GetAllTeamsDto) {
    const { keyword, page, pageSize, limit } = query;

    const filterQuery: {
      [key: string]: any;
    } = {};

    if (!!keyword) {
      filterQuery.OR = [
        {
          name: { contains: keyword },
        },
        {
          game: {
            name: { contains: keyword },
          },
        },
        {
          bio: { contains: keyword },
        },
      ];
    }

    const data = await this.prismaService.teams.findMany({
      where: filterQuery,
      take: +pageSize,
      skip: limit,
      select: {
        id: true,
        name: true,
        image: true,
        game: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    const count = await this.prismaService.teams.count({
      where: filterQuery,
    });

    return this._pagination('get teams success', data, count, +page, +pageSize);
  }

  async getDetailTeam(id: number) {
    const data = await this.prismaService.teams.findUnique({
      where: { id },
      include: {
        TeamMembers: {
          where: {
            status: 'joined',
          },
          select: {
            id: true,
            role: true,
            status: true,
            in_game_id: true,
            in_game_name: true,

            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                bio: true,
                avatar: true,
              },
            },
          },
        },
        game: true,
      },
    });

    if (!data) {
      throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
    }

    return this._success('get team detail success', data);
  }

  async editTeam(payload: UpdateTeamDto, id: number) {
    const foundData = await this.prismaService.teams.findUnique({
      where: { id },
    });

    if (!foundData) {
      throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
    }

    if (this.req.user.role != 'super_admin') {
      const findMember = await this.prismaService.teamMembers.findFirst({
        where: {
          team_id: id,
          user_id: this.req.user.id,
        },
      });

      if (!findMember) {
        throw new HttpException(
          'You are not a member of this team',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (findMember.role != 'captain') {
        throw new HttpException(
          'You are not the captain of this team',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    try {
      await this.prismaService.teams.update({
        where: foundData,
        data: payload,
      });

      return this._success('Team updated successfully');
    } catch (error) {
      throw new HttpException(
        'Failed to update team',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteTeam(id: number) {
    const foundData = await this.prismaService.teams.findUnique({
      where: { id },
    });

    if (!foundData) {
      throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
    }

    if (this.req.user.role != 'super_admin') {
      const findMember = await this.prismaService.teamMembers.findFirst({
        where: {
          team_id: id,
          user_id: this.req.user.id,
        },
      });

      if (!findMember) {
        throw new HttpException(
          'You are not a member of this team',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }

      if (findMember.role != 'captain') {
        throw new HttpException(
          'You are not the captain of this team',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    try {
      await this.prismaService.teams.delete({ where: foundData });

      return this._success('Team deleted successfully');
    } catch (error) {
      throw new HttpException(
        'Failed to delete team',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async inviteMember(id: number, payload: InviteTeamDto) {
    const foundData = await this.prismaService.teams.findUnique({
      where: { id },
    });

    if (!foundData) {
      throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
    }
    const findMember = await this.prismaService.teamMembers.findFirst({
      where: {
        team_id: id,
        user_id: this.req.user.id,
      },
    });

    if (!findMember) {
      throw new HttpException(
        'You are not a member of this team',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (findMember.role != 'captain') {
      throw new HttpException(
        'You are not the captain of this team',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const findInvitedMember = await this.prismaService.teamMembers.findFirst({
      where: {
        team_id: id,
        user_id: payload.user_id,
      },
    });

    if (!!findInvitedMember) {
      throw new HttpException(
        'User is already invited to your team',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

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
      const newMember = await this.prismaService.teamMembers.create({
        data: {
          team_id: id,
          user_id: payload.user_id,
          status: 'invited',
          role: 'player',
        },
      });

      return this._success('Member invited successfully', newMember);
    } catch (error) {
      console.log(error);
      throw new HttpException(
        'Failed to invite member',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async acceptInvitation(id: number, payload : AcceptInvitationDto) {
    const foundData = await this.prismaService.teamMembers.findFirst({
      where: { id, user_id: this.req.user.id, status: 'invited' },
    });

    if (!foundData) {
      throw new HttpException('Invitation not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.prismaService.teamMembers.update({
        where: { id },
        data: { ...payload, status: 'joined' },
      });

      return this._success('Invitation accepted successfully');
    } catch (error) {
      throw new HttpException(
        'Failed to accept invitation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async listMembers(id: number, query: TeamMembersFilterDto) {
    const { keyword, status, page, pageSize, limit } = query;
    const foundData = await this.prismaService.teams.findUnique({
      where: { id },
    });

    if (!foundData) {
      throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
    }

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
            }
          }
        }
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

  async updateMemberData(
    idTeam: number,
    idMember: number,
    payload: UpdateTeamMember,
  ) {
    const foundData = await this.prismaService.teams.findUnique({
      where: { id: idTeam },
    });

    if (!foundData) {
      throw new HttpException('Team not found', HttpStatus.NOT_FOUND);
    }

    const findMember = await this.prismaService.teamMembers.findFirst({
      where: {
        team_id: idTeam,
        user_id: this.req.user.id,
      },
    });

    if (!findMember) {
      throw new HttpException(
        'You are not a member of this team',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (findMember.role != 'captain') {
      throw new HttpException(
        'You are not the captain of this team',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const foundMember = await this.prismaService.teamMembers.findUnique({
      where: { id: idMember },
    });

    if (!foundMember)
      throw new HttpException('no member found', HttpStatus.NOT_FOUND);

    try {
      const data = await this.prismaService.teamMembers.update({
        where: foundMember,
        data: payload
      })

      return this._success('success update member', data)
    } catch (error) {
      throw new HttpException('smth went wrong!', HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
