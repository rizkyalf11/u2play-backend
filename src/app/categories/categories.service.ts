/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  CreateCategoryDto,
  FindAllCategoriesDto,
  UpdateCategoryDto,
} from './categories.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';

@Injectable()
export class CategoriesService extends BaseResponse {
  constructor(private prisma: PrismaService) {
    super();
  }

  async removeBulk(ids: number[]) {
    try {
      if (!ids || ids.length === 0) {
        throw new HttpException(
          {
            code: 'NO_IDS_PROVIDED',
            message: 'No category IDs provided for bulk delete',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Cek apakah semua ID ada di database
      const existingCategories = await this.prisma.category.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      });

      const existingIds = existingCategories.map((cat) => cat.id);
      const notFoundIds = ids.filter((id) => !existingIds.includes(id));

      if (notFoundIds.length > 0) {
        throw new HttpException(
          {
            code: 'CATEGORY_NOT_FOUND',
            message: `Categories with IDs [${notFoundIds.join(', ')}] not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Hapus kategori sekaligus
      const deleted = await this.prisma.category.deleteMany({
        where: { id: { in: ids } },
      });

      return this._success(`${deleted.count} categories deleted successfully`);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        {
          code: 'BULK_DELETE_FAILED',
          message: error.message || 'Failed to delete categories in bulk',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(data: CreateCategoryDto) {
    // 🔹 Cek duplikat nama kategori
    const existingCategory = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: data.name,
        },
      },
    });

    if (existingCategory) {
      throw new HttpException(
        {
          code: 'CATEGORY_NAME_EXISTS',
          message: `Category name "${data.name}" already exists`,
        },
        HttpStatus.CONFLICT, // 409 → conflict data
      );
    }

    // 🔹 Cek parent_id jika ada
    if (data.parent_id) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parent_id },
      });
      if (!parent) {
        throw new HttpException(
          {
            code: 'PARENT_CATEGORY_NOT_FOUND',
            message: `Parent category with ID ${data.parent_id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
    }

    const category = await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        parent_id: data.parent_id ?? null,
      },
    });

    return {
      success: true,
      message: 'Category created successfully',
      data: category,
    };
  }

  async findAll(params: FindAllCategoriesDto) {
    const { page, pageSize, name, keyword } = params;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    // Filter berdasarkan name
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { slug: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: Number(pageSize),
        include: {
          children: true,
          parent: true,
        },
      }),
      this.prisma.category.count({ where }),
    ]);

    return this._pagination(
      'Categories fetched successfully',
      categories,
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new HttpException(
        {
          code: 'CATEGORY_NOT_FOUND',
          message: `Category with ID ${id} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    await this.findOne(id); // cek dulu kalau tidak ada akan error
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // cek dulu kalau tidak ada akan error
    return this.prisma.category.delete({ where: { id } });
  }
}
