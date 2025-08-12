/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto, FindAllTagsDto, UpdateTagDto } from './tags.dto';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';

@Injectable()
export class TagsService extends BaseResponse {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(data: CreateTagDto) {
    const tag = await this.prisma.tag.create({ data });
    return {
      success: true,
      message: 'Tag created successfully',
      data: tag,
    };
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

  async findOneAndIncrementView(id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
      include: {
        category: true,
        article_tags: { include: { tag: true } },
      },
    });

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // Increment view_count
    await this.prisma.articles.update({
      where: { id },
      data: {
        view_count: { increment: 1 },
      },
    });

    return {
      message: 'Article fetched successfully',
      data: { ...article, view_count: article.view_count + 1 },
    };
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
    return tag;
  }

  async update(id: number, data: UpdateTagDto) {
    await this.findOne(id); // cek dulu
    const updated = await this.prisma.tag.update({
      where: { id },
      data,
    });
    return {
      success: true,
      message: 'Tag updated successfully',
      data: updated,
    };
  }

  async remove(id: number) {
    await this.findOne(id); // cek dulu
    await this.prisma.tag.delete({ where: { id } });
    return {
      success: true,
      message: 'Tag deleted successfully',
    };
  }
}
