import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/guard/role/roles.decorator';
import { CreateMemberDto } from './members.dto';

@UseGuards( JwtGuard, RoleGuard)
@ApiBearerAuth('token')
@Controller('members')
export class MembersController {
    constructor(private membersService: MembersService) {}

    @Roles(['super_admin'])
    @Post('/')
    createMember(@Body() payload: CreateMemberDto) {
        return this.membersService.createMember(payload)
    }
}
