import { ApiProperty, PickType } from '@nestjs/swagger';
import { MemberRoles, MemberStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class MemberDto {
  @IsNumber()
  id: number;

  @IsNumber()
  @ApiProperty({ example: 1, description: 'team id' })
  team_id: number;

  @IsNumber()
  @ApiProperty({ example: 1, description: 'user id' })
  user_id: number;

  @IsEnum(MemberRoles)
  @ApiProperty({ example: 'player', description: 'player, coach, manager, captain' })
  role: MemberRoles;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '1300188888', description: 'in game id' })
  in_game_id?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'player name', description: 'in game name'})
  in_game_name?: string;

  @IsEnum(MemberStatus)
  @ApiProperty({ example: 'invited', description: 'invited, joined, rejected, leaved' })
  status: MemberStatus;

  @IsDate()
  @Type(() => Date)
  @IsOptional()
  @ApiProperty({ example: '2020-08-09', description: 'team description' })
  invited_at?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @ApiProperty({ example: '2020-08-09', description: 'team description' })
  joined_at?: Date;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  @ApiProperty({ example: '2020-08-09', description: 'team description' })
  rejected_at?: Date;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  @ApiProperty({ example: '2020-08-09', description: 'team description' })
  leaved_at?: Date;
}

export class CreateMemberDto extends PickType(MemberDto, [
  'in_game_id',
  'in_game_name',
  'role',
  'status',
  'team_id',
  'user_id',
]) {}
