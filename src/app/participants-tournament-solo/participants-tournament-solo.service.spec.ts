import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsTournamentSoloService } from './participants-tournament-solo.service';

describe('ParticipantsTournamentSoloService', () => {
  let service: ParticipantsTournamentSoloService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParticipantsTournamentSoloService],
    }).compile();

    service = module.get<ParticipantsTournamentSoloService>(ParticipantsTournamentSoloService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
