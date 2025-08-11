import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessTokenStrategy } from './jwt.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtAccessTokenStrategy],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ]
})
export class AuthModule {}
