import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOptionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
