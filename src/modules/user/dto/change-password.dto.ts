// src/users/dto/change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'current strongpassword',
    description: 'текуший Пароль пользователя',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    example: 'strongpassword',
    description: 'Пароль пользователя',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
