import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateParticipantSoloDto,
  FindAllParticipantSoloDto,
  UpdateParticipantSoloDto,
} from './participants-tournament-solo.dto';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class ParticipantsTournamentSoloService extends BaseResponse {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async create(data: CreateParticipantSoloDto) {
    try {
      const userId = this.req.user.id; // otomatis ambil user login

      const participant = await this.prisma.participants_tournament_solo.create(
        {
          data: {
            ...data,
            user_id: userId, // auto isi dari req.user
          },
        },
      );

      return {
        status: 'success',
        message: 'Participant created successfully',
        data: participant,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to create participant',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(query: FindAllParticipantSoloDto) {
    const { page = 1, pageSize = 10, in_game_name, tournament_id } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (in_game_name) {
      where.in_game_name = {
        contains: in_game_name,
      };
    }

    if (tournament_id) {
      where.tournament_id = +tournament_id;
    }

    const [items, total] = await Promise.all([
      this.prisma.participants_tournament_solo.findMany({
        where,
        skip,
        take: +pageSize,
        include: {
          user: true,
          tournament: true,
          //   group: true,
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.participants_tournament_solo.count({ where }),
    ]);

    return this._pagination(
      'Participants fetched successfully',
      items,
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const participant =
      await this.prisma.participants_tournament_solo.findUnique({
        where: { id },
        include: {
          user: true,
          tournament: true,
          //   group: true,
        },
      });
    if (!participant) {
      throw new NotFoundException(`Participant with ID ${id} not found`);
    }
    return this._success('ok berhasil', participant);
  }

  async update(id: number, data: UpdateParticipantSoloDto) {
    await this.findOne(id); // cek dulu
    const updated = await this.prisma.participants_tournament_solo.update({
      where: { id },
      data,
    });
    return this._success('ok berhasil', updated);
  }

  async remove(id: number) {
    await this.findOne(id); // cek dulu
    await this.prisma.participants_tournament_solo.delete({ where: { id } });
    return this._success('ok berhasil dihapus');
  }
}
