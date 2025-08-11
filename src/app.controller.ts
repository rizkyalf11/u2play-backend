import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtGuard } from './guard/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { REQUEST } from '@nestjs/core';
import { RoleGuard } from './guard/role/role.guard';
import { Roles } from './guard/role/roles.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['admin'])
  @ApiBearerAuth('token')
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
