import { Test, TestingModule } from '@nestjs/testing';
import { TournamentBroadcastTalentsController } from './tournament-broadcast-talents.controller';

describe('TournamentBroadcastTalentsController', () => {
  let controller: TournamentBroadcastTalentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TournamentBroadcastTalentsController],
    }).compile();

    controller = module.get<TournamentBroadcastTalentsController>(TournamentBroadcastTalentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
