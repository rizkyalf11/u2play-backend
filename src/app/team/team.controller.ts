import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import {
    AcceptInvitationDto,
  CreateTeamDto,
  GetAllTeamsDto,
  InviteTeamDto,
  TeamMembersFilterDto,
  UpdateTeamDto,
  UpdateTeamMember,
} from './team.dto';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/roles.decorator';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';

@Controller('teams')
export class TeamController {
  constructor(private teamService: TeamService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin', 'user'])
  @ApiBearerAuth('token')
  @Post('/')
  createTeam(@Body() payload: CreateTeamDto) {
    return this.teamService.createTeam(payload);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user'])
  @ApiBearerAuth('token')
  @Get('/me/membership')
  @ApiQuery({
    name: 'gameId',
    required: false,
    description: 'Filter membership untuk game tertentu (opsional)',
    example: 1,
  })
  checkMyMembership() {
    return this.teamService.checkMyMembership();
  }

  @Get('/')
  @ApiPaginationQuery()
  @ApiQuery({
    name: 'keyword',
    required: false,
    example: 'keyword',
    description: 'Filter by name, game, and bio',
  })
  getAllTeams(@Pagination() query: GetAllTeamsDto) {
    return this.teamService.getAllTeams(query);
  }

  @Get('/:id')
  getDeatailTeam(@Param('id') id: number) {
    return this.teamService.getDetailTeam(+id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin', 'user'])
  @ApiBearerAuth('token')
  @Put('/:id')
  updateTeam(@Param('id') id: number, @Body() payload: UpdateTeamDto) {
    return this.teamService.editTeam(payload, +id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin', 'user'])
  @ApiBearerAuth('token')
  @Delete('/:id')
  deleteTeam(@Param('id') id: number) {
    return this.teamService.deleteTeam(+id);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user'])
  @ApiBearerAuth('token')
  @Post('/invite/:id')
  inviteTeam(@Param('id') id: number, @Body() payload: InviteTeamDto) {
    return this.teamService.inviteMember(+id, payload);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user'])
  @ApiBearerAuth('token')
  @Post('/accept-invitation/:id')
  acceptInvitation(@Param('id') id: number, @Body() payload: AcceptInvitationDto) {
    return this.teamService.acceptInvitation(+id, payload);
  }

  @Get('/members/:id')
  @ApiPaginationQuery()
  @ApiQuery({
    name: 'keyword',
    required: false,
    example: 'keyword',
    description: 'Filter by name, game, and bio',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    example: 'invited',
    description:
      'Status harus salah satu dari: invited, joined, rejected, leaved',
  })
  getTeamMembers(
    @Param('id') id: number,
    @Pagination() query: TeamMembersFilterDto,
  ) {
    return this.teamService.listMembers(+id, query);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user'])
  @ApiBearerAuth('token')
  @Put('/members/:idMember')
  updateMemberdata(
    @Param('idMember') idMember: number,
    @Body() payload: UpdateTeamMember,
  ) {
    return this.teamService.updateMemberData(idMember, payload);
  }

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user'])
  @ApiBearerAuth('token')
  @Put('/kick/:idMember')
  kick(@Param('idMember') idMember: number) {
    return this.teamService.kickMember(+idMember)
  }
}
