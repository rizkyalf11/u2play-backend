import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import {
  CreateCategoryDto,
  FindAllCategoriesDto,
  UpdateCategoryDto,
} from './categories.dto';
import { CategoriesService } from './categories.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';

@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth('token')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoriesService) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const data = await this.categoryService.create(dto);
    return {
      success: true,
      message: 'Category created successfully',
      data,
    };
  }

  @Get()
  @ApiPaginationQuery()
  @ApiQuery({ name: 'name', required: false, example: 'Nama kategori' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    example: 'kata kunci pencarian',
  })
  async findAll(@Pagination() query: FindAllCategoriesDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoryService.findOne(id);
    return {
      success: true,
      message: 'Category retrieved successfully',
      data,
    };
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    const data = await this.categoryService.update(id, dto);
    return {
      success: true,
      message: 'Category updated successfully',
      data,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const data = await this.categoryService.remove(id);
    return {
      success: true,
      message: 'Category deleted successfully',
      data,
    };
  }
}
