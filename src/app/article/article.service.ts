import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  ArticleDetailQueryDto,
  CreateArticleDto,
  findAllArticlesDto,
  UpdateArticleDto,
} from './aritcle.dto';
import { REQUEST } from '@nestjs/core';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

@Injectable()
export class ArticleService extends BaseResponse {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private req: any,
  ) {
    super();
  }

  async create(data: CreateArticleDto) {
    if (!data.title || data.title.trim().length === 0) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, message: 'Title is required' },
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = await this.prisma.category.findUnique({
      where: { id: data.category_id },
    });

    if (!category) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Category ID ${data.category_id} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (!category.parent_id) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          message: `Category ID ${data.category_id} is a parent category, please use a sub-category`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const { tag_ids, ...articleData } = data;

    if (tag_ids && tag_ids.length > 0) {
      const existingTags = await this.prisma.tag.findMany({
        where: { id: { in: tag_ids } },
        select: { id: true },
      });

      const existingTagIds = existingTags.map((tag) => tag.id);
      const invalidTags = tag_ids.filter((id) => !existingTagIds.includes(id));

      if (invalidTags.length > 0) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `Tag(s) with ID ${invalidTags.join(', ')} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

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

    if (title) {
      where.title = { contains: title };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { content: { contains: keyword } },
      ];
    }

    const [articles, total] = await Promise.all([
      this.prisma.articles.findMany({
        where,
        skip,
        take: +pageSize,
        include: {
          category: true,
          article_tags: { include: { tag: true } },
        },
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

    if (!article) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Article with ID ${id} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

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

  async findOneAndIncrementView(
    id: number,
    ipAddress: string,
    query: ArticleDetailQueryDto,
  ) {
    const { latestLimit, popularLimit, recommendationLimit } = query;

    const article = await this.prisma.articles.findUnique({
      where: { id },
      include: {
        category: { include: { parent: true } },
        article_tags: { include: { tag: true } },
        author: true,
      },
    });

    if (!article) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Article with ID ${id} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentView = await this.prisma.articleViews.findFirst({
      where: {
        article_id: id,
        ip_address: ipAddress,
        viewed_at: { gte: twentyFourHoursAgo },
      },
    });

    if (!recentView) {
      await this.prisma.articleViews.create({
        data: { article_id: id, ip_address: ipAddress },
      });

      await this.prisma.articles.update({
        where: { id },
        data: { view_count: { increment: 1 } },
      });

      article.view_count += 1;
    }

    const [popularArticles, latestArticles, recommendations] =
      await Promise.all([
        this.prisma.articles.findMany({
          orderBy: { view_count: 'desc' },
          take: Number(popularLimit),
          include: {
            author: true,
            category: { include: { parent: true } },
          },
        }),
        this.prisma.articles.findMany({
          orderBy: { created_at: 'desc' },
          take: Number(latestLimit),
          include: {
            author: true,
            category: { include: { parent: true } },
          },
        }),
        this.prisma.articles.findMany({
          where: { category_id: article.category_id, id: { not: id } },
          orderBy: { created_at: 'desc' },
          take: Number(recommendationLimit),
          include: {
            author: true,
            category: { include: { parent: true } },
          },
        }),
      ]);

    const formatArticle = (a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      author_name: a.author?.name || null,
      created_at: format(new Date(a.created_at), 'EEE, dd MMMM yyyy', {
        locale: idLocale,
      }),
      sub_category: a.category?.parent?.name || null,
    });

    return this._success('Article fetched successfully', {
      article: article,
      popular: popularArticles.map(formatArticle),
      latest: latestArticles.map(formatArticle),
      recommendations: recommendations.map(formatArticle),
    });
  }

  async removeBulk(ids: number[]) {
    // Cek apakah semua ID valid
    const existingArticles = await this.prisma.articles.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    const existingIds = existingArticles.map((a) => a.id);
    const notFoundIds = ids.filter((id) => !existingIds.includes(id));

    if (notFoundIds.length > 0) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: `Article(s) with ID ${notFoundIds.join(', ')} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    // Hapus relasi article_tags terlebih dahulu
    await this.prisma.articleTag.deleteMany({
      where: { article_id: { in: ids } },
    });

    // Hapus artikelnya
    const deleted = await this.prisma.articles.deleteMany({
      where: { id: { in: ids } },
    });

    return this._success('Articles deleted successfully', { data: deleted });
  }
}
