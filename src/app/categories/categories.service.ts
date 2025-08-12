/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(data: CreateCategoryDto) {
    // Kalau parent_id dikirim, cek apakah parent ada
    if (data.parent_id) {
      const parent = await this.prisma.category.findUnique({
        where: { id: data.parent_id },
      });
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${data.parent_id} not found`,
        );
      }
    }

    return {
      success: true,
      message: 'Category created successfully',
      data: await this.prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          parent_id: data.parent_id ?? null, // kalau undefined → null
        },
      }),
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
      include: {
        // children: true,
        // parent: true,
      },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    await this.findOne(id); // cek dulu
    return this.prisma.category.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id); // cek dulu
    return this.prisma.category.delete({ where: { id } });
  }
}
