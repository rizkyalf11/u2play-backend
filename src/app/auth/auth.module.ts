import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessTokenStrategy } from './jwt.strategy';
import { AuthSuperService } from './auth-super.service';
import { AuthSuperController } from './auth-super.controller';

@Module({
  controllers: [AuthController, AuthSuperController],
  providers: [AuthService, JwtAccessTokenStrategy, AuthSuperService],
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
    }),
  ]
})
export class AuthModule {}
