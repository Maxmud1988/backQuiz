// create-user-question-answer.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsArray,
  IsString,
  IsNumber,
} from 'class-validator';

/**
 * 1. Если нужно сделать валидацию на уровне DTO,
 *    что при type = 'single_choice' должен быть 1 элемент
 *    — это довольно сложно без загрузки question.type.
 * 2. Поэтому чаще делаем это в сервисе, после того,
 *    как узнаём question.type из БД.
 */
export class CreateUserQuestionAnswerDto {
  @ApiProperty()
  @IsUUID()
  userQuizResultId: string;

  @ApiProperty()
  @IsUUID()
  questionId: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  chosenOptionIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textAnswer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  score?: number;
}
