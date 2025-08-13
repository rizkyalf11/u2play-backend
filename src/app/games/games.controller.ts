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
import { GamesService } from './games.service';
import { CreateGameDto, FindAllGamesDto, UpdateGameDto } from './games.dto';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/roles.decorator';

@ApiTags('Games')
@Controller('games')
export class GamesController {
  constructor(private readonly gamesService: GamesService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @ApiBearerAuth('token')
  @Post()
  create(@Body() data: CreateGameDto) {
    return this.gamesService.create(data);
  }

  @Get()
  @ApiPaginationQuery()
  @ApiQuery({ name: 'name', required: false, example: 'Counter Strike' })
  @ApiQuery({
    name: 'keyword',
    required: false,
    example: 'kata kunci pencarian game',
  })
  async findAll(@Pagination() query: FindAllGamesDto) {
    return this.gamesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.findOne(id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @ApiBearerAuth('token')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateGameDto) {
    return this.gamesService.update(id, data);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @ApiBearerAuth('token')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.gamesService.remove(id);
  }
}
