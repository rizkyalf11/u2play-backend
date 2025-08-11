import { Test, TestingModule } from '@nestjs/testing';
import { AuthSuperService } from './auth-super.service';

describe('AuthSuperService', () => {
  let service: AuthSuperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthSuperService],
    }).compile();

    service = module.get<AuthSuperService>(AuthSuperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
