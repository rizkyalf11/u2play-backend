import { ApiProperty, ApiPropertyOptional, OmitType, PickType } from '@nestjs/swagger';
import { AuthRole, Provider } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PageRequestDto } from 'src/utils/dto/page.dto';

export class AuthDTO {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ example: '01', description: 'Account ID' })
  id: string;

  @IsString()
  @ApiProperty({ example: 'user', description: 'Account name' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'username', description: 'Account username' })
  username: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'this is bio', description: 'Account bio' })
  bio: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'this is nik', description: 'Account nik' })
  nik: string;

  @IsString()
  @IsEmail()
  @ApiProperty({ example: 'user@gmail.com', description: 'Account email' })
  email: string;

  //   @IsString()
  //   @IsOptional()
  //   avatar: string;

  @IsEnum(AuthRole)
  @IsOptional()
  @ApiProperty({ example: 'user', description: 'Account role' })
  role: AuthRole;

  @IsString()
  @Length(8)
  @ApiProperty({ example: '12345678', description: 'Account password' })
  password: string;

  @IsEnum(Provider)
  @ApiProperty({ example: 'credential', description: 'Account provider' })
  provider: Provider;
}

export class RegisterDto extends PickType(AuthDTO, [
  'name',
  'email',
  'password',
  'username',
]) {}
export class LoginDto extends PickType(AuthDTO, [
  'email',
  'password',
]) {}

// auth super DTO
export class CreateUserDto extends OmitType(AuthDTO, [
    'id'
]) {}
export class UpdateUserDto extends OmitType(AuthDTO, [
    'id'
]) {}

export class GetUserFilterDto extends PageRequestDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'keyword', description: 'Filter by username' })
  keyword?: string;

  
}