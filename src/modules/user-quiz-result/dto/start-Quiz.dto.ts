import { IsString } from 'class-validator';

export class StartQuizDto {
  @IsString()
  quizId: string;
}
