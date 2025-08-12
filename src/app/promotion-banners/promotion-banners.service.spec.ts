import { Test, TestingModule } from '@nestjs/testing';
import { PromotionBannersService } from './promotion-banners.service';

describe('PromotionBannersService', () => {
  let service: PromotionBannersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromotionBannersService],
    }).compile();

    service = module.get<PromotionBannersService>(PromotionBannersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
