import { Test, TestingModule } from '@nestjs/testing';
import { AuthSuperController } from './auth-super.controller';

describe('AuthSuperController', () => {
  let controller: AuthSuperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthSuperController],
    }).compile();

    controller = module.get<AuthSuperController>(AuthSuperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
