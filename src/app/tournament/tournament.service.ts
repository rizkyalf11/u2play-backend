import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { CreateTournamentDto, GetTournamentFilter } from './tounamaent.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class TournamentService extends BaseResponse {
  constructor(
    private prismaService: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async uniqueCheck(slug: string) {
    const findOne = await this.prismaService.tournaments.findUnique({
      where: {
        tournaments_slug: slug,
      },
    });

    if (findOne) return this._success('success', { isExist: true });

    return this._success('success', { isExist: false });
  }

  async createTournament(payload: CreateTournamentDto) {
    const foundSlug = await this.prismaService.tournaments.findUnique({
      where: {
        tournaments_slug: payload.tournaments_slug,
      },
    });

    if (!!foundSlug)
      throw new HttpException(
        'slug lready used!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    const foundChallonge = await this.prismaService.tournaments.findUnique({
      where: {
        tournament_challonge_url: payload.tournament_challonge_url,
      },
    });

    if (!!foundChallonge)
      throw new HttpException(
        'slug lready used!',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );

    try {
      const data = await this.prismaService.tournaments.create({
        data: { ...payload, organized_by: this.req.user.id },
      });

      return this._success('success create tournament', data);
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'smth went wrong!',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTournamets(query: GetTournamentFilter) {
    const { limit, pageSize, page, keyword, status, game_id } = query;

    const filterQuery: {
      [key: string]: any;
    } = {};

    if (!!keyword) {
      filterQuery.OR = [{ tournament_name: {contains: keyword} }, { description: {contains: keyword} }];
    }

    if (!!game_id) {
      filterQuery.game_id = +game_id;
    }

    if (!!status) {
      if (
        !['pending', 'in_progress', 'awaiting_review', 'complete'].includes(
          status,
        )
      )
        throw new HttpException(
          'please input correct status',
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      filterQuery.status = status;
    }

    const data = await this.prismaService.tournaments.findMany({
      where: filterQuery,
      skip: limit,
      take: +pageSize,
      include: {
        Game: true,
        Organized: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true
          }
        }
      }
    });

    const count = await this.prismaService.tournaments.count({
      where: filterQuery,
    });

    return this._pagination('success', data, count, +page, +pageSize);
  }
}
