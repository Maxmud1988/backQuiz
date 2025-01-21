import { PartialType } from '@nestjs/mapped-types';
import { CreateUserQuizResultDto } from './create-user-quiz-result.dto';

export class UpdateUserQuizResultDto extends PartialType(
  CreateUserQuizResultDto,
) {}
