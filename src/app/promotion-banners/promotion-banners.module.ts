import { Module } from '@nestjs/common';
import { PromotionBannersController } from './promotion-banners.controller';
import { PromotionBannersService } from './promotion-banners.service';

@Module({
  controllers: [PromotionBannersController],
  providers: [PromotionBannersService]
})
export class PromotionBannersModule {}
