/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateGameDto, FindAllGamesDto, UpdateGameDto } from './games.dto';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';

@Injectable()
export class GamesService extends BaseResponse {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(data: CreateGameDto) {
    const game = await this.prisma.games.create({ data });
    return {
      success: true,
      message: 'Game created successfully',
      data: game,
    };
  }

  async findAll(query: FindAllGamesDto) {
    const { page = 1, pageSize = 10, name, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (name) {
      where.name = { contains: name };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { image: { contains: keyword } },
        { banner: { contains: keyword } },
      ];
    }

    const [games, total] = await Promise.all([
      this.prisma.games.findMany({
        where,
        skip,
        take: +pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.games.count({ where }),
    ]);

    return this._pagination(
      'Games fetched successfully',
      games,
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const game = await this.prisma.games.findUnique({ where: { id } });
    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }
    return game;
  }

  async update(id: number, data: UpdateGameDto) {
    await this.findOne(id); // cek dulu
    const updated = await this.prisma.games.update({ where: { id }, data });
    return {
      success: true,
      message: 'Game updated successfully',
      data: updated,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // cek dulu
    await this.prisma.games.delete({ where: { id } });
    return {
      success: true,
      message: 'Game deleted successfully',
    };
  }
}
