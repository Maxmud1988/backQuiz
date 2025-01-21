import { IsUUID, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserQuizResultDto {
  @ApiProperty({ description: 'The ID of the quiz' })
  @IsUUID()
  quizId: string;

  @ApiProperty({ description: 'The ID of the user' })
  @IsUUID()
  userId: string; // Обычно userId берётся из токена, но если вам нужно явно передавать

  @ApiPropertyOptional({ description: 'The score of the user' })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ description: 'The maximum score possible' })
  @IsOptional()
  @IsNumber()
  maxScore?: number;
}
