import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './app/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { CategoriesModule } from './app/categories/categories.module';
import { ArticleModule } from './app/article/article.module';
import { TagsModule } from './app/tags/tags.module';
import { UploadController } from './app/upload/upload.controller';
import { GamesModule } from './app/games/games.module';
import { PromotionBannersModule } from './app/promotion-banners/promotion-banners.module';
import { NotificationsModule } from './app/notifications/notifications.module';
import { EmailModule } from './app/email/email.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { TeamModule } from './app/team/team.module';
import { MembersModule } from './app/members/members.module';
import { TournamentModule } from './app/tournament/tournament.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    CategoriesModule,
    ArticleModule,
    TagsModule,
    GamesModule,
    PromotionBannersModule,
    NotificationsModule,
    EmailModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 10,
        },
      ],
    }),
    TeamModule,
    MembersModule,
    TournamentModule,
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule {}
