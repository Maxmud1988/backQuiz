// src/question/question.controller.ts
import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { AtGuard } from '../auth/guards';

@Controller('question')
@UseGuards(AtGuard)
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post(':quizId')
  create(
    @Param('quizId') quizId: string,
    @Body() dto: CreateQuestionDto,
    @Request() req,
  ) {
    const userId = req.user.sub;
    const userRole = req.user.role;
    return this.questionService.createQuestion(dto, quizId, userId, userRole);
  }
}
