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
import { TournamentBroadcastTalentsService } from './tournament-broadcast-talents.service';
import {
  CreateTournamentBroadcastTalentDto,
  FindAllTournamentBroadcastTalentsDto,
  UpdateTournamentBroadcastTalentDto,
} from './tournament-broadcast-talents.dto';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';

@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth('token')
@ApiTags('Tournament Broadcast Talents')
@Controller('tournament-broadcast-talents')
export class TournamentBroadcastTalentsController {
  constructor(private readonly service: TournamentBroadcastTalentsService) {}

  @Post()
  create(@Body() data: CreateTournamentBroadcastTalentDto) {
    return this.service.create(data);
  }

  @Get()
  @ApiPaginationQuery()
  @ApiQuery({ name: 'tournament_id', required: false, example: 1 })
  @ApiQuery({ name: 'talent_id', required: false, example: 2 })
  async findAll(@Pagination() query: FindAllTournamentBroadcastTalentsDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateTournamentBroadcastTalentDto,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
