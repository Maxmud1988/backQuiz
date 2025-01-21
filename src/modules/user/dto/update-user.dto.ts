import {
  IsEmail,
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  IsInt,
  IsDate,
  IsNotEmpty,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../Enums/role.enum';

export class UpdateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Новый email пользователя',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный формат email' })
  readonly email?: string;

  @ApiProperty({
    example: 'JohnDoe',
    description: 'Новое имя пользователя',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Username должен быть строкой' })
  username?: string;
}
