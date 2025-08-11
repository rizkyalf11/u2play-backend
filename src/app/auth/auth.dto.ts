import { ApiProperty, PickType } from '@nestjs/swagger';
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
  'username'
]) {}