import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class sendEmailDto {

  @IsString()
  username: string;
  @IsString()
  link: string;
  @IsEmail()
  email: string;

}
