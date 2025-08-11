import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtGuard } from './guard/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { REQUEST } from '@nestjs/core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtGuard)
  @ApiBearerAuth('token')
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
