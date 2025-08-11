import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthSuperService } from './auth-super.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/guard/role/roles.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { CreateUserDto } from './auth.dto';

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
    @Get('/')
    getUsers() {
        return this.authSuperService.getUsers();
    }
}
