/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
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
  Req,
  Query,
} from '@nestjs/common';
import {
  ArticleDetailQueryDto,
  CreateArticleDto,
  DeleteBulkArticleDto,
  findAllArticlesDto,
  UpdateArticleDto,
} from './aritcle.dto';
import { RoleGuard } from 'src/guard/role/role.guard';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { IncomingMessage } from 'http';
import { Roles } from 'src/guard/role/roles.decorator';
// import { Pagination } from 'src/utils/decorators/pagination.decorator';

@Controller('article')
export class ArticleController {
  constructor(private readonly articlesService: ArticleService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @ApiBearerAuth('token')
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
  @ApiQuery({ name: 'categorySlug', required: false, example: 'kategori-slug' })
  @ApiQuery({ name: 'tagSlug', required: false, example: 'tag-slug' })
  async findAll(@Pagination() query: findAllArticlesDto) {
    return this.articlesService.findAll(query);
  }

  @Get(':id')
  @ApiQuery({
    name: 'popularLimit',
    required: false,
    example: 1,
    description: 'Max popular articles',
  })
  @ApiQuery({
    name: 'latestLimit',
    required: false,
    example: 1,
    description: 'Max latest articles',
  })
  @ApiQuery({
    name: 'recommendationLimit',
    required: false,
    example: 1,
    description: 'Max recommended articles',
  })
  async findOne(
    @Param('id') id: string,
    @Req() req: Request & IncomingMessage,
    @Query() query: ArticleDetailQueryDto,
  ) {
    const ipAddress =
      req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      req.socket.remoteAddress ||
      'unknown';

    return this.articlesService.findOneAndIncrementView(+id, ipAddress, query);
  }

  @UseGuards(JwtGuard, RoleGuard)
  // @Roles(['admin'])
  @ApiBearerAuth('token')
  @Post('bulk-delete')
  async removeBulk(@Body() dto: DeleteBulkArticleDto) {
    return this.articlesService.removeBulk(dto.ids);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['admin'])
  @ApiBearerAuth('token')
  @Put(':id')
  @ApiOperation({ summary: 'Update article by ID' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['admin'])
  @ApiBearerAuth('token')
  @Delete(':id')
  @ApiOperation({ summary: 'Delete article by ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.articlesService.remove(id);
  }
}
