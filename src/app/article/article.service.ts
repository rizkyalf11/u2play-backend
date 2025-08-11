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
    // 1. Cek apakah kategori ada
    const category = await this.prisma.category.findUnique({
      where: { id: data.category_id },
    });

    if (!category) {
      throw new NotFoundException(`Category ID ${data.category_id} not found`);
    }

    // 2. Validasi: hanya boleh pakai sub kategori (punya parent_id)
    if (category.parent_id === null || category.parent_id === undefined) {
      throw new BadRequestException(
        `Category ID ${data.category_id} is a parent category, please use a sub-category`,
      );
    }

    // 3. Simpan artikel jika lolos validasi
    const article = await this.prisma.articles.create({
      data,
      include: {
        category: true, // opsional kalau mau return info kategori
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
    // Pastikan artikel ada
    await this.findOne(id);

    // Jika user mengirim category_id baru, validasi sub-kategori
    if (data.category_id) {
      const category = await this.prisma.category.findUnique({
        where: { id: data.category_id },
      });

      if (!category) {
        throw new NotFoundException(
          `Category ID ${data.category_id} not found`,
        );
      }

      if (category.parent_id === null || category.parent_id === undefined) {
        throw new BadRequestException(
          `Category ID ${data.category_id} is a parent category, please use a sub-category`,
        );
      }
    }

    // Pisahkan tag_ids untuk relasi many-to-many
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
