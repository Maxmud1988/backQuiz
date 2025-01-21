import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty({ description: 'The text of the question' })
  @IsNotEmpty()
  @IsString()
  text: string;

  @ApiProperty({
    description: 'The type of the question',
    enum: ['single_choice', 'multiple_choice', 'text', 'ordering', 'matching'],
  })
  @IsEnum(['single_choice', 'multiple_choice', 'text', 'ordering', 'matching'])
  type: string;

  @ApiProperty({
    description: 'The score of the question',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  score?: number; // по умолчанию 1
}
