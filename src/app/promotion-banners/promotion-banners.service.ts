/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import BaseResponse from 'src/utils/baseresponse/baseresponse.class';
import {
  CreatePromotionBannerDto,
  FindAllPromotionBannersDto,
  UpdatePromotionBannerDto,
} from './promotion-banners.dto';

@Injectable()
export class PromotionBannersService extends BaseResponse {
  constructor(private prisma: PrismaService) {
    super();
  }

  async create(data: CreatePromotionBannerDto) {
    const banner = await this.prisma.promotion_banners.create({ data });
    return {
      success: true,
      message: 'Promotion banner created successfully',
      data: banner,
    };
  }

  async findAll(query: FindAllPromotionBannersDto) {
    const { page = 1, pageSize = 10, image, link_url, keyword } = query;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (image) {
      where.image = { contains: image };
    }

    if (link_url) {
      where.link_url = { contains: link_url };
    }

    if (keyword) {
      where.OR = [
        { image: { contains: keyword } },
        { link_url: { contains: keyword } },
      ];
    }

    const [banners, total] = await Promise.all([
      this.prisma.promotion_banners.findMany({
        where,
        skip,
        take: +pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.promotion_banners.count({ where }),
    ]);

    return this._pagination(
      'Promotion banners fetched successfully',
      banners,
      total,
      page,
      pageSize,
    );
  }

  async findOne(id: number) {
    const banner = await this.prisma.promotion_banners.findUnique({
      where: { id },
    });
    if (!banner)
      throw new NotFoundException(`Promotion banner with ID ${id} not found`);
    return banner;
  }

  async update(id: number, data: UpdatePromotionBannerDto) {
    await this.findOne(id);
    const updated = await this.prisma.promotion_banners.update({
      where: { id },
      data,
    });
    return {
      success: true,
      message: 'Promotion banner updated successfully',
      data: updated,
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.promotion_banners.delete({ where: { id } });
    return {
      success: true,
      message: 'Promotion banner deleted successfully',
    };
  }
}
