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
import { AuthSuperService } from './auth-super.service';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Roles } from 'src/guard/role/roles.decorator';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { CreateUserDto, GetUserFilterDto } from './auth.dto';
import { Pagination } from 'src/utils/decorators/pagination.decorator';
import { ApiPaginationQuery } from 'src/utils/decorators/pagination.swagger';
import { get } from 'http';

@Controller('users')
export class AuthSuperController {
  constructor(private authSuperService: AuthSuperService) {}

  @ApiBearerAuth('token')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @Post('/')
  createUser(@Body() payload: CreateUserDto) {
    return this.authSuperService.createUser(payload);
  }

  @ApiPaginationQuery()
  @Get('/')
  getUsers(@Pagination() query: GetUserFilterDto) {
    return this.authSuperService.getUsers(query);
  }

  @ApiBearerAuth('token')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @Put('/:id')
  updateUser(@Param('id') id: number, @Body() payload: CreateUserDto) {
    return this.authSuperService.updateUser(+id, payload);
  }

  @ApiBearerAuth('token')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @Get('/:id')
  detailUser(@Param('id') id: number) {
    return this.authSuperService.detailUser(+id);
  }

  @ApiBearerAuth('token')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['super_admin'])
  @Delete('/:id')
  deleteUser(@Param('id') id: number) {
    return this.authSuperService.deleteUser(+id);
  }
}
