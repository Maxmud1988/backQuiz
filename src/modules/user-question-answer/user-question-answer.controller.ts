import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserQuestionAnswerService } from './user-question-answer.service';
import { CreateUserQuestionAnswerDto } from './dto/create-user-question-answer.dto';
import { UpdateUserQuestionAnswerDto } from './dto/update-user-question-answer.dto';
import { AtGuard } from '../auth/guards'; // или ваш путь

@Controller('user-question-answer')
@UseGuards(AtGuard)
export class UserQuestionAnswerController {
  constructor(private readonly answerService: UserQuestionAnswerService) {}

  @Post()
  async submitAnswer(@Request() req, @Body() dto: CreateUserQuestionAnswerDto) {
    const userId = req.user.sub;
    return this.answerService.submitAnswer(dto, userId);
  }

  @Patch(':answerId')
  async updateAnswer(
    @Request() req,
    @Param('answerId') answerId: string,
    @Body() dto: UpdateUserQuestionAnswerDto,
  ) {
    const userId = req.user.sub;
    return this.answerService.updateAnswer(answerId, dto, userId);
  }
}
