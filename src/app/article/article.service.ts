// src/app/articles/articles.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateArticleDto, UpdateArticleDto } from './aritcle.dto';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateArticleDto) {
    // 1. Cek kategori ada atau nggak
    const category = await this.prisma.category.findUnique({
      where: { id: data.category_id },
    });

    if (!category) {
      throw new NotFoundException(`Category ID ${data.category_id} not found`);
    }

    // 2. Cek apakah dia sub kategori (parent_id harus ada)
    if (!category.parent_id) {
      throw new BadRequestException(
        `Category ID ${data.category_id} is a parent category, please use a sub-category`,
      );
    }

    // 3. Kalau lolos, baru create
    const { tag_ids, ...articleData } = data; // pisahkan tag_ids dari DTO

    const article = await this.prisma.articles.create({
      data: {
        ...articleData,
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

    return {
      success: true,
      message: 'Article created successfully',
      data: article,
    };
  }

  async findAll() {
    return this.prisma.articles.findMany({
      include: {
        category: true,
        // author: true,
        article_tags: { include: { tag: true } },
      },
    });
  }

  async findOne(id: number) {
    const article = await this.prisma.articles.findUnique({
      where: { id },
      include: {
        category: true,
        // author: true,
        article_tags: { include: { tag: true } },
      },
    });
    if (!article)
      throw new NotFoundException(`Article with ID ${id} not found`);
    return article;
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
              deleteMany: {}, // hapus semua tag lama
              create: tag_ids.map((tagId) => ({ tag_id: tagId })),
            }
          : undefined,
      },
      include: {
        article_tags: { include: { tag: true } },
      },
    });

    return {
      success: true,
      message: 'Article updated successfully',
      data: updated,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.articleTag.deleteMany({ where: { article_id: id } });
    const deleted = await this.prisma.articles.delete({ where: { id } });
    return {
      success: true,
      message: 'Article deleted successfully',
      data: deleted,
    };
  }
}
