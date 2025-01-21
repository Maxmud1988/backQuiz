import { IsString } from 'class-validator';

export class FinishQuizDto {
  @IsString()
  resultId: string;
}
