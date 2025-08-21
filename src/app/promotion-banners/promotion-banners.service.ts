import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
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
    try {
      // Contoh validasi bisnis: cek jika link_url sudah dipakai
      const exists = await this.prisma.promotion_banners.findFirst({
        where: { link_url: data.link_url },
      });
      if (exists) {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            message: `Promotion banner with link "${data.link_url}" already exists`,
          },
          HttpStatus.CONFLICT,
        );
      }

      const banner = await this.prisma.promotion_banners.create({ data });

      return this._success('Promotion banner created successfully', {
        data: banner,
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // biarkan HttpException langsung dilempar
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to create promotion banner',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(query: FindAllPromotionBannersDto) {
    try {
      const { page = 1, pageSize = 10, image, link_url, keyword } = query;

      if (page <= 0 || pageSize <= 0) {
        throw new HttpException(
          {
            status: HttpStatus.BAD_REQUEST,
            message: 'Page and pageSize must be greater than 0',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const skip = (page - 1) * pageSize;
      const where: any = {};

      if (image) where.image = { contains: image };
      if (link_url) where.link_url = { contains: link_url };
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
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to fetch promotion banners',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      if (!id || id <= 0) {
        throw new HttpException(
          { status: HttpStatus.BAD_REQUEST, message: 'Invalid banner ID' },
          HttpStatus.BAD_REQUEST,
        );
      }

      const banner = await this.prisma.promotion_banners.findUnique({
        where: { id },
      });
      if (!banner) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            message: `Promotion banner with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return this._success('Promotion banner fetched successfully', {
        data: banner,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to fetch promotion banner',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, data: UpdatePromotionBannerDto) {
    try {
      await this.findOne(id);

      const updated = await this.prisma.promotion_banners.update({
        where: { id },
        data,
      });

      return this._success('Promotion banner updated successfully', {
        data: updated,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to update promotion banner',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      await this.prisma.promotion_banners.delete({ where: { id } });

      return this._success('Promotion banner deleted successfully', {});
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message || 'Failed to delete promotion banner',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
