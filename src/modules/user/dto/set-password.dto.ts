// src/users/dto/set-password.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty } from 'class-validator';

export class SetPasswordDto {
  @ApiProperty({ description: 'newPassword' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;

  @ApiProperty({ description: 'confirmPassword' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;
}
