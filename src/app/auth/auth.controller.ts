import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('login')
  login() {
    return this.authService.login();
  }

  @Post('/register')
  register(@Body() payload: RegisterDto) {
    return this.authService.register(payload);
  }
}
