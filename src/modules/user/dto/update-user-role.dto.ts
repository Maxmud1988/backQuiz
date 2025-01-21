// src/users/dto/update-user-role.dto.ts
import { IsEnum } from 'class-validator';
import { Role } from '../enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({ description: 'role', enum: Role })
  @IsEnum(Role)
  role: Role;
}
