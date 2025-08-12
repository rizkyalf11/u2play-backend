/* eslint-disable prettier/prettier */
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ArticleService } from './article.service';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  
} from '@nestjs/common';
import {
  CreateArticleDto,
  findAllArticlesDto,
  UpdateArticleDto,
} from './aritcle.dto';
import { RoleGuard } from 'src/guard/role/role.guard';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
// import { Pagination } from 'src/utils/decorators/pagination.decorator';

@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth('token')
@Controller('article')
export class ArticleController {
  constructor(private readonly articlesService: ArticleService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  async create(@Body() createArticleDto: CreateArticleDto) {
    return this.articlesService.create(createArticleDto);
  }

  @Get()

  @ApiPaginationQuery()
  @ApiQuery({ name: 'title', required: false, example: 'Judul artikel' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    example: 'kata kunci pencarian',
  })
  async findAll(@Pagination() query: findAllArticlesDto) {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get article by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update article by ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete article by ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}
