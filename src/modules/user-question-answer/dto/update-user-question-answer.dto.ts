// update-user-question-answer.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateUserQuestionAnswerDto } from './create-user-question-answer.dto';

export class UpdateUserQuestionAnswerDto extends PartialType(
  CreateUserQuestionAnswerDto,
) {}
