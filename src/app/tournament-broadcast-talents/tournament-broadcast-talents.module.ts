import { Module } from '@nestjs/common';
import { TournamentBroadcastTalentsController } from './tournament-broadcast-talents.controller';
import { TournamentBroadcastTalentsService } from './tournament-broadcast-talents.service';

@Module({
  controllers: [TournamentBroadcastTalentsController],
  providers: [TournamentBroadcastTalentsService]
})
export class TournamentBroadcastTalentsModule {}
