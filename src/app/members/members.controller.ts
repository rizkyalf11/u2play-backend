import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/guard/role/roles.decorator';
import { CreateMemberDto, GetAllMemberFilterDto, UpdateMemberDto } from './members.dto';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { Pagination } from 'src/utils/decorators/pagination.decorator';

@UseGuards(JwtGuard, RoleGuard)
@ApiBearerAuth('token')
@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Roles(['super_admin'])
  @Post('/')
  createMember(@Body() payload: CreateMemberDto) {
    return this.membersService.createMember(payload);
  }

  @Roles(['super_admin'])
  @Get('/')
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
  getTeamMembers(@Pagination() query: GetAllMemberFilterDto) {
    return this.membersService.listMember(query);
  }

  @Roles(['super_admin'])
  @Get('/:id')
  getDetail(@Param('id') id: number) {
    return this.membersService.getDetail(+id);
  }

  @Roles(['super_admin'])
  @Put('/:id')
  updateMember(@Param("id") id: number, @Body() payload: UpdateMemberDto) {
    return this.membersService.updateMember(+id, payload)
  }

  @Roles(['super_admin'])
  @Delete('/:id')
  deleteMember(@Param('id') id: number) {
    return this.membersService.deleteMember(+id)
  }
}
