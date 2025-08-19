import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  TournamentStatus,
  TournamentType,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class TournamentDto {
  @IsInt()
  id: number;

  @IsInt()
  organized_by: number;

  @IsString()
  @ApiProperty({ example: 'valorant vct', description: 'tournament name' })
  tournament_name: string;

  @IsString()
  @ApiProperty({
    example: 'https://dummyimage.com/600x600/000/fff&text=ini+dummy',
    description: 'image link',
  })
  image: string;

  @IsEnum(TournamentStatus)
  @ApiProperty({ example: 'pending', description: 'tournament status' })
  status: TournamentStatus;

  @IsString()
  @Length(4)
  @ApiProperty({ example: 'vct2025', description: 'slug' })
  tournaments_slug: string;

  @IsString()
  @ApiProperty({ example: 'https://', description: 'challonge tournament url' })
  tournament_challonge_url: string;

  @IsString()
  @ApiProperty({ example: 'this is desc', description: 'description' })
  description: string;

  @IsInt()
  @ApiProperty({ example: 1, description: 'game id' })
  game_id: number;

  @IsEnum(TournamentType)
  @ApiProperty({ example: 'single_stage', description: 'tournament type' })
  tournament_type: TournamentType;

  @ApiProperty({
    example: 'single_elimination',
    description: 'tournament format',
  })
  @IsString()
  tournament_format: string;

  @ApiProperty({ example: 'single_elimination', description: 'group format' })
  @IsString()
  group_stage_format: string;

  @IsInt()
  @ApiProperty({ example: 5, description: 'participant count' })
  participants_per_group: number;

  @IsInt()
  @ApiProperty({ example: 2, description: 'advance count' })
  advance_per_group: number;

  @IsBoolean()
  @ApiProperty({ example: false, description: 'is paid?' })
  is_paid: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '0', description: 'fee' })
  fee?: string;

  @IsBoolean()
  @ApiProperty({ example: false, description: 'participant limit' })
  limited_participant: boolean;

  @IsInt()
  @IsOptional()
  @ApiProperty({ example: 10, description: 'max participant' })
  max_participant?: number;

  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-08-01', description: 'regis open' })
  registration_open: Date;
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-08-05', description: 'regis close' })
  registration_close: Date;
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-08-20', description: 'in game id' })
  tournament_start: Date;
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2025-08-27', description: 'in game id' })
  tournament_end: Date;

  @IsBoolean()
  @ApiProperty({ example: false, description: 'in game id' })
  required_check_in: boolean;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiProperty({ example: '2025-07-24', description: 'in game id' })
  check_in_date?: Date;

  @IsBoolean()
  @ApiProperty({ example: false, description: 'in game id' })
  is_offline_tournament: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '', description: 'in game id' })
  location_address?: string;

  @IsBoolean()
  @ApiProperty({ example: false, description: 'in game id' })
  has_prize: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '', description: 'in game id' })
  prize_pool?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '', description: 'in game id' })
  youtube_link?: string;
}

export class CreateTournamentDto extends OmitType(TournamentDto, ['id', 'organized_by']) {}

export class GetTournamentFilter extends PageRequestDto {
    @IsString()
    @IsOptional()
    keyword: string

    @IsEnum(TournamentStatus)
    @IsOptional()
    status: TournamentStatus

    @IsInt()
    @IsOptional()
    game_id: number
}
