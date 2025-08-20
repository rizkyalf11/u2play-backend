import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsTournamentSoloController } from './participants-tournament-solo.controller';

describe('ParticipantsTournamentSoloController', () => {
  let controller: ParticipantsTournamentSoloController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantsTournamentSoloController],
    }).compile();

    controller = module.get<ParticipantsTournamentSoloController>(ParticipantsTournamentSoloController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
