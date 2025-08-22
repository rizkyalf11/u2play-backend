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

  async checkDuplicate(tournamentId: number, userId: number) {
    const exists = await this.prisma.participants_tournament_solo.findFirst({
      where: {
        tournament_id: tournamentId,
        user_id: userId,
      },
    });

    return !!exists; // true kalau sudah ada
  }

  // Tambahin fungsi baru di service
  async findUsersByTournament(tournamentId: number) {
    // cek tournament ada atau tidak
    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException(
        `Tournament dengan id ${tournamentId} tidak ditemukan`,
      );
    }

    // ambil list participants beserta user nya
    const participants =
      await this.prisma.participants_tournament_solo.findMany({
        where: { tournament_id: tournamentId },
        include: {
          user: true, // otomatis ambil data user (misalnya username, email, dsb)
        },
        orderBy: { created_at: 'desc' },
      });

    return this._success(
      `List participants untuk tournament ${tournament.tournament_name}`,
      participants,
    );
  }

  async create(data: CreateParticipantSoloDto) {
    try {
      const userId = this.req.user.id; // otomatis ambil user login

      const tournament = await this.prisma.tournaments.findUnique({
        where: { id: data.tournament_id },
      });

      if (!tournament) {
        throw new NotFoundException(
          `Tournament dengan id ${data.tournament_id} tidak ditemukan`,
        );
      }

      // 🚨 validasi duplikat
      const alreadyJoined = await this.checkDuplicate(
        data.tournament_id,
        userId,
      );
      if (alreadyJoined) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            message: 'User sudah terdaftar di tournament ini',
          },
          HttpStatus.CONFLICT,
        );
      }

      const participant = await this.prisma.participants_tournament_solo.create(
        {
          data: {
            ...data,
            user_id: userId,
          },
        },
      );

      return this._success('Participant created successfully', participant);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to create participant',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async checkEndpoint(tournamentId: number) {
    const userId = this.req.user.id;
    const alreadyJoined = await this.checkDuplicate(tournamentId, userId);

    return this._success('Check participant status', {
      alreadyJoined,
      tournamentId,
      userId,
    });
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
