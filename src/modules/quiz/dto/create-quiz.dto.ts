import { IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuizDto {
  @ApiProperty({ description: 'The title of the quiz' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'The description of the quiz' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Indicates if the quiz is public' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
