import { CreateCategoryDto, UpdateCategoryDto } from './categories.dto';
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
} from '@nestjs/common';

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
  async findAll() {
    const data = await this.categoryService.findAll();
    return {
      success: true,
      message: 'Categories retrieved successfully',
      data,
    };
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
