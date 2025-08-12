import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthSuperService } from './auth-super.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/guard/role/roles.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { CreateUserDto, GetUserFilterDto } from './auth.dto';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { get } from 'http';

@ApiBearerAuth('token')
@UseGuards(JwtGuard, RoleGuard)
@Controller('users')
export class AuthSuperController {
    constructor(private authSuperService: AuthSuperService) {}

    @Roles(['super_admin'])
    @Post('/')
    createUser(@Body() payload: CreateUserDto) {
        return this.authSuperService.createUser(payload);
    }

    @Roles(['super_admin'])
    @ApiPaginationQuery()
    @ApiQuery({name : 'keyword', required: false, example: 'keyword', description: 'Filter by username, name or email'})
    @Get('/')
    getUsers(@Pagination() query: GetUserFilterDto) {
        return this.authSuperService.getUsers(query);
    }

    @Roles(['super_admin'])
    @Put('/:id')
    updateUser(@Param('id') id: number, @Body() payload: CreateUserDto) {
        return this.authSuperService.updateUser(+id, payload);
    }

    @Roles(['super_admin'])
    @Get('/:id')
    detailUser(@Param('id') id: number) {
        return this.authSuperService.detailUser(+id);
    }
}
