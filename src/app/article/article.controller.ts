import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
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
  Query,
} from '@nestjs/common';
import {
  CreateArticleDto,
  findAllArticlesDto,
  UpdateArticleDto,
} from './aritcle.dto';
import { RoleGuard } from 'src/guard/role/role.guard';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { Pagination } from 'src/utils/decorators/pagination.decorator';

@UseGuards(JwtGuard, RoleGuard)
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
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 20 })
  @ApiQuery({ name: 'title', required: false, example: 'Judul artikel' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    example: 'kata kunci pencarian',
  })
  async findAll(@Query() query: findAllArticlesDto) {
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
