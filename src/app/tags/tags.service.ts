/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto, FindAllTagsDto, UpdateTagDto } from './tags.dto';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';

@Injectable()
export class TagsService extends BaseResponse {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(data: CreateTagDto) {
    try {
      // Cek duplikasi slug
      const exists = await this.prisma.tag.findFirst({
        where: { slug: data.slug },
      });
      if (exists) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            message: `Tag with slug "${data.slug}" already exists`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const tag = await this.prisma.tag.create({ data });
      return this._success('Tag created successfully', { data: tag });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to create tag',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(query: FindAllTagsDto) {
    const { page = 1, pageSize = 10, name, slug, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (name) {
      where.name = {
        contains: name,
        // mode: 'insensitive',
      };
    }

    if (slug) {
      where.slug = {
        contains: slug,
        // mode: 'insensitive',
      };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { slug: { contains: keyword } },
      ];
    }

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip,
        take: +pageSize,
        include: {
          article_tags: {
            include: {
              article: true,
            },
          },
          _count: {
            select: { article_tags: true },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.tag.count({ where }),
    ]);

    return this._pagination(
      'Tags fetched successfully',
      tags,
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        article_tags: { include: { article: true } },
      },
    });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    return this._success('ok berhasil', tag);
  }

  async update(id: number, data: UpdateTagDto) {
    await this.findOne(id); // cek dulu
    const updated = await this.prisma.tag.update({
      where: { id },
      data,
    });
    return this._success('ok berhasil', updated);
  }

  async remove(id: number) {
    await this.findOne(id); // cek dulu
    await this.prisma.tag.delete({ where: { id } });
    return this._success('ok berhasil dihapus');
  }
}
