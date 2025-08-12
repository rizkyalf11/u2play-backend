/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/app/articles/articles.service.ts
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreateArticleDto,
  findAllArticlesDto,
  UpdateArticleDto,
} from './aritcle.dto';
import { REQUEST } from '@nestjs/core';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';

@Injectable()
export class ArticleService extends BaseResponse {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async create(data: CreateArticleDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: data.category_id },
    });

    if (!category) {
      throw new NotFoundException(`Category ID ${data.category_id} not found`);
    }

    if (!category.parent_id) {
      throw new BadRequestException(
        `Category ID ${data.category_id} is a parent category, please use a sub-category`,
      );
    }

    const { tag_ids, ...articleData } = data;

    const article = await this.prisma.articles.create({
      data: {
        ...articleData,
        author_id: this.req.user.id,
        article_tags: tag_ids
          ? {
              create: tag_ids.map((tagId) => ({
                tag_id: tagId,
              })),
            }
          : undefined,
      },
      include: {
        article_tags: { include: { tag: true } },
      },
    });

    return this._success('Article created successfully', { data: article });
  }

  async findAll(params: findAllArticlesDto) {
    const { page, pageSize, title, keyword } = params;

    const skip = (page - 1) * pageSize;

    const where: any = {};

    // Filter berdasarkan title
    if (title) {
      where.title = { contains: title, mode: 'insensitive' };
    }

    // Filter berdasarkan keyword (di title, description, atau content)
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.articles.findMany({
        where,
        skip,
        take: pageSize,
        include: {
          category: true,
          article_tags: { include: { tag: true } },
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.articles.count({ where }),
    ]);

    return this._pagination(
      'Articles fetched successfully',
      articles,
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
      include: {
        category: true,
        article_tags: { include: { tag: true } },
      },
    });

    if (!article)
      throw new NotFoundException(`Article with ID ${id} not found`);

    return this._success('Article fetched successfully', { data: article });
  }

  async update(id: number, data: UpdateArticleDto) {
    await this.findOne(id);

    const { tag_ids, ...articleData } = data;

    const updated = await this.prisma.articles.update({
      where: { id },
      data: {
        ...articleData,
        article_tags: tag_ids
          ? {
              deleteMany: {},
              create: tag_ids.map((tagId) => ({ tag_id: tagId })),
            }
          : undefined,
      },
      include: {
        article_tags: { include: { tag: true } },
      },
    });

    return this._success('Article updated successfully', { data: updated });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.articleTag.deleteMany({ where: { article_id: id } });

    const deleted = await this.prisma.articles.delete({ where: { id } });

    return this._success('Article deleted successfully', { data: deleted });
  }
}
