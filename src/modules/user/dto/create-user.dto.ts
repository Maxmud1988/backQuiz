import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../Enums/role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'JohnDoe',
    description: 'Имя пользователя',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty({ message: 'Username не должен быть пустым' })
  readonly username?: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'Email пользователя',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @IsNotEmpty({ message: 'Email не должен быть пустым' })
  readonly email: string;

  @ApiProperty({
    example: 'strongpassword',
    description: 'Пароль пользователя (не менее 8 символов)',
  })
  @IsNotEmpty({ message: 'Пароль не должен быть пустым' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  hash: string;

  @ApiProperty({
    example: 'user',
    description: 'Роль пользователя (по умолчанию user)',
    required: false,
    enum: Role,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Роль должна быть одним из допустимых значений' })
  role?: Role;
}
