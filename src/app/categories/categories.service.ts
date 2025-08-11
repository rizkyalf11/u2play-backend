import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

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

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        // children: true,
        // parent: true,
      },
    });
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
