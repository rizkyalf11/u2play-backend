import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { MemberRoles, MemberStatus } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class TeamDto {
  @IsString()
  @Length(8)
  @ApiProperty({ example: 'team-12345678', description: 'team name' })
  name: string;

  @IsNumber()
  @ApiProperty({ example: 1, description: 'team game' })
  game_id: number;

  @IsString()
  @Length(8)
  @ApiProperty({
    example: 'https://dummyimage.com/600x600/000/fff&text=ini+dummy',
    description: 'image link',
  })
  image: string;

  @IsString()
  @ApiProperty({ example: '00000000', description: 'team name' })
  noTelp: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'this is team bio', description: 'team description' })
  bio?: string;
}

export class CreateTeamDto extends TeamDto {}
export class UpdateTeamDto extends TeamDto {}

export class GetAllTeamsDto extends PageRequestDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'keyword',
    description: 'Filter by name, game, and bio',
  })
  keyword?: string;
}

export class InviteTeamDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 1, description: 'user id' })
  user_id: number;
}

 enum MemberStatuses {
  INVITED = 'invited',
  JOINED = 'joined',
  REJECTED = 'rejected',
  LEAVED = 'leaved',
}

export class TeamMembersFilterDto extends PageRequestDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    example: 'keyword',
    description: 'Filter by username, name or email',
  })
  keyword?: string;

  @IsOptional()
  @IsEnum(MemberStatuses, {
    message: 'Status harus salah satu dari: invited, joined, rejected, leaved',
  })
  @ApiPropertyOptional({
    example: 'invited',
    description:
      'Status harus salah satu dari: invited, joined, rejected, leaved',
  })
  status?: MemberStatus;
}

export class TeamMemberDto {
    @IsEnum(MemberRoles)
    @ApiProperty({ example: 'player', description: 'captain, player, manager, coach ' })
    role: MemberRoles

    @IsString()
    @ApiProperty({ example: 'my_game_id', description: 'in game id' })
    in_game_id: string;

    @IsString()
    @ApiProperty({ example: 'my_game_name', description: 'in game name' })
    in_game_name: string;
}

export class UpdateTeamMember extends TeamMemberDto {}
export class AcceptInvitationDto extends OmitType(TeamMemberDto, ['role']) {}
