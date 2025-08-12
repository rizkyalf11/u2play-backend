import { Test, TestingModule } from '@nestjs/testing';
import { PromotionBannersController } from './promotion-banners.controller';

describe('PromotionBannersController', () => {
  let controller: PromotionBannersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PromotionBannersController],
    }).compile();

    controller = module.get<PromotionBannersController>(PromotionBannersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
