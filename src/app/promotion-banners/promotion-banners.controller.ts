/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PromotionBannersService } from './promotion-banners.service';
import {
  CreatePromotionBannerDto,
  FindAllPromotionBannersDto,
  UpdatePromotionBannerDto,
} from './promotion-banners.dto';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/roles.decorator';

// @UseGuards(JwtGuard, RoleGuard)
// @ApiBearerAuth('token')
@ApiTags('Promotion Banners')
@Controller('promotion-banners')
export class PromotionBannersController {
  constructor(private readonly bannersService: PromotionBannersService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @ApiBearerAuth('token')
  @Post()
  create(@Body() data: CreatePromotionBannerDto) {
    return this.bannersService.create(data);
  }

  @Get()
  @ApiPaginationQuery()
  async findAll(@Pagination() query: FindAllPromotionBannersDto) {
    return this.bannersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.findOne(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @ApiBearerAuth('token')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdatePromotionBannerDto,
  ) {
    return this.bannersService.update(id, data);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @ApiBearerAuth('token')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bannersService.remove(id);
  }
}
