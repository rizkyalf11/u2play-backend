import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TournamentService } from './tournament.service';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/roles.decorator';
import { CreateTournamentDto, GetTournamentFilter } from './tounamaent.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';

@Controller('tournament')
export class TournamentController {
  constructor(private tournamentService: TournamentService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @ApiBearerAuth('token')
  @Roles(['organizer'])
  @Post('/create')
  create(@Body() payload: CreateTournamentDto) {
    return this.tournamentService.createTournament(payload);
  }

  @Post('/uniquecheck')
  uniqueCheck(@Body('slug') slug: string) {
    return this.tournamentService.uniqueCheck(slug);
  }

  @Get('/list')
  @ApiPaginationQuery()
  @ApiQuery({
    name: 'keyword',
    required: false,
    description: 'Filter by name and desc',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description:
      'Status harus salah satu dari: pending, in_progress, awaiting-review, complete',
  })
  @ApiQuery({
    name: 'game_id',
    required: false,
    description:
      'game id',
  })
  getTournaments(@Pagination() query: GetTournamentFilter) {
    return this.tournamentService.getTournamets(query);
  }

  @Get('/detail/:id')
  getDetail(@Param('id') id: number) {
    return this.tournamentService.getDetail(id)
  }
}
