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
import { TagsService } from './tags.service';
import { CreateTagDto, FindAllTagsDto, UpdateTagDto } from './tags.dto';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';

@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth('token')
@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() data: CreateTagDto) {
    return this.tagsService.create(data);
  }

  @Get()
  @ApiPaginationQuery()
  @ApiQuery({ name: 'name', required: false, example: 'Nama tag' })
  @ApiQuery({ name: 'slug', required: false, example: 'slug-tag' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    example: 'kata kunci pencarian',
  })
  async findAll(@Pagination() query: FindAllTagsDto) {
    return this.tagsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateTagDto) {
    return this.tagsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}
