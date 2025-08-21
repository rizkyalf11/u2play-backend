import { Test, TestingModule } from '@nestjs/testing';
import { TournamentBroadcastTalentsService } from './tournament-broadcast-talents.service';

describe('TournamentBroadcastTalentsService', () => {
  let service: TournamentBroadcastTalentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TournamentBroadcastTalentsService],
    }).compile();

    service = module.get<TournamentBroadcastTalentsService>(TournamentBroadcastTalentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
