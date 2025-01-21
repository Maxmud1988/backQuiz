// src/auth/dto/signup.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;
}
export class Tokens {
  @ApiProperty({ description: 'JWT Access Token' })
  access_token: string;

  @ApiProperty({ description: 'JWT Refresh Token' })
  refresh_token: string;
}
