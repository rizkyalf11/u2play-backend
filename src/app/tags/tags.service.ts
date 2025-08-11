import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTagDto, UpdateTagDto } from './tags.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateTagDto) {
    const tag = await this.prisma.tag.create({ data });
    return {
      success: true,
      message: 'Tag created successfully',
      data: tag,
    };
  }

  async findAll() {
    return this.prisma.tag.findMany({
      include: {
        article_tags: { include: { article: true } },
      },
    });
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
