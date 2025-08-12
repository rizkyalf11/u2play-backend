import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgetPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './auth.dto';
import { JwtGuard } from 'src/guard/auth/auth.guard';
import { RoleGuard } from 'src/guard/role/role.guard';
import { Roles } from 'src/guard/role/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Post('/register')
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }
  
  @ApiBearerAuth('token')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(['user'])
  @Get('/profile')
  getProfile() {
    return this.authService.getProfile();
  }

  @Throttle({ default: { limit: 3, ttl: 600000000000000 } })
  @Post('/forgot-password')
  forgotPassword(@Body() payload: ForgetPasswordDto) {
    return this.authService.forgetPassword(payload);
  }

  @Put('/reset-password/:userID/:token')
  resetPassword(
    @Body() payload: ResetPasswordDto,
    @Param('userID') userID: number,
    @Param('token') token: string,
  ) {
    return this.authService.resetPassword(+userID, token, payload);
  }
}