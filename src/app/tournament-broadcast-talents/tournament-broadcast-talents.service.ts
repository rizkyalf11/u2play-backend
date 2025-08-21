/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateTournamentBroadcastTalentDto,
  FindAllTournamentBroadcastTalentsDto,
  UpdateTournamentBroadcastTalentDto,
} from './tournament-broadcast-talents.dto';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';

@Injectable()
export class TournamentBroadcastTalentsService extends BaseResponse {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(data: CreateTournamentBroadcastTalentDto) {
    try {
      const exists = await this.prisma.tournament_broadcast_talents.findFirst({
        where: {
          tournament_id: data.tournament_id,
          talent_id: data.talent_id,
          role: data.role,
        },
      });
      if (exists) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            message: `Talent already assigned with this role in the tournament`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const created = await this.prisma.tournament_broadcast_talents.create({
        data,
        include: { tournament: true, talent: true },
      });

      return this._success('Tournament broadcast talent created successfully', {
        data: created,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            error.message || 'Failed to create tournament broadcast talent',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(query: FindAllTournamentBroadcastTalentsDto) {
    const { page = 1, pageSize = 10, tournament_id, talent_id } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (tournament_id) where.tournament_id = tournament_id;
    if (talent_id) where.talent_id = talent_id;

    const [records, total] = await Promise.all([
      this.prisma.tournament_broadcast_talents.findMany({
        where,
        skip,
        take: +pageSize,
        include: {
          tournament: true,
          talent: true,
        },
        orderBy: {
          id: 'desc',
        },
      }),
      this.prisma.tournament_broadcast_talents.count({ where }),
    ]);

    return this._pagination(
      'Tournament broadcast talents fetched successfully',
      records,
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const record = await this.prisma.tournament_broadcast_talents.findUnique({
      where: { id },
      include: { tournament: true, talent: true },
    });
    if (!record) {
      throw new NotFoundException(
        `Tournament broadcast talent with ID ${id} not found`,
      );
    }
    return this._success('ok berhasil', record);
  }

  async update(id: number, data: UpdateTournamentBroadcastTalentDto) {
    await this.findOne(id); // cek dulu
    const updated = await this.prisma.tournament_broadcast_talents.update({
      where: { id },
      data,
      include: { tournament: true, talent: true },
    });
    return this._success('ok berhasil', updated);
  }

  async remove(id: number) {
    await this.findOne(id); // cek dulu
    await this.prisma.tournament_broadcast_talents.delete({ where: { id } });
    return this._success('ok berhasil dihapus');
  }
}
