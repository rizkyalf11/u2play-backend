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
import { ParticipantsTournamentSoloService } from './participants-tournament-solo.service';
import {
  CreateParticipantSoloDto,
  FindAllParticipantSoloDto,
  UpdateParticipantSoloDto,
} from './participants-tournament-solo.dto';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';

@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth('token')
@ApiTags('Participants Tournament Solo')
@Controller('participants-solo')
export class ParticipantsTournamentSoloController {
  constructor(private readonly service: ParticipantsTournamentSoloService) {}

  @Post()
  create(@Body() data: CreateParticipantSoloDto) {
    return this.service.create(data);
  }

  @Get()
  @ApiPaginationQuery()
  @ApiQuery({ name: 'in_game_name', required: false, example: 'Player123' })
  @ApiQuery({ name: 'tournament_id', required: false, example: 10 })
  async findAll(@Pagination() query: FindAllParticipantSoloDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
  @Get('check/:tournamentId')
  check(@Param('tournamentId', ParseIntPipe) tournamentId: number) {
    return this.service.checkEndpoint(tournamentId);
  }

  @Get('tournament/:tournamentId/users')
  findUsersByTournament(
    @Param('tournamentId', ParseIntPipe) tournamentId: number,
  ) {
    return this.service.findUsersByTournament(tournamentId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateParticipantSoloDto,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
