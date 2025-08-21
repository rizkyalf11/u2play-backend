import { Module } from '@nestjs/common';
import { ParticipantsTournamentSoloController } from './participants-tournament-solo.controller';
import { ParticipantsTournamentSoloService } from './participants-tournament-solo.service';

@Module({
  controllers: [ParticipantsTournamentSoloController],
  providers: [ParticipantsTournamentSoloService]
})
export class ParticipantsTournamentSoloModule {}
