import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UserQuizResultService } from './user-quiz-result.service';
import { RolesGuard } from '../auth/guards';
import { Roles } from '../auth/decarators';
import { Role } from '../user/Enums/role.enum';

// DTO (примеры)

import { AtGuard } from '../auth/guards';
import { StartQuizDto } from './dto/start-Quiz.dto';

@Controller('user-quiz-result')
@UseGuards(AtGuard) // Требуется авторизация
export class UserQuizResultController {
  constructor(private readonly resultService: UserQuizResultService) {}

  /**
   * Начать прохождение теста
   * Пример: POST /user-quiz-result/start
   * Body: { quizId: "..." }
   */
  @Post('start')
  async startQuiz(@Request() req, @Body() body: StartQuizDto) {
    const userId = req.user.sub; // или req.user.id
    const { quizId } = body;
    return this.resultService.startQuiz(quizId, userId);
  }

  /**
   * Завершить прохождение теста (подсчитать результат)
   * Пример: PATCH /user-quiz-result/finish/:resultId
   */
  @Patch('finish/:resultId')
  async finishQuiz(@Request() req, @Param('resultId') resultId: string) {
    const userId = req.user.sub; // получаем текущего пользователя
    return this.resultService.finishQuiz(resultId, userId);
  }

  /**
   * Получить конкретный результат (например, для просмотра в личном кабинете)
   * Пример: GET /user-quiz-result/:id
   */
  @Get(':id')
  async getResultById(@Request() req, @Param('id') id: string) {
    const result = await this.resultService.getResultById(id);
    if (!result) {
      throw new NotFoundException('Result not found');
    }
    // Проверяем, что этот userId == result.userId или роль = admin
    if (result.userId !== req.user.sub && req.user.role !== Role.ADMIN) {
      throw new ForbiddenException('Access denied');
    }
    return result;
  }

  /**
   * Пример (необязательный) — получить все результаты пользователя
   * Пример: GET /user-quiz-result/my
   */
  @Get('my/all')
  async getAllMyResults(@Request() req) {
    const userId = req.user.sub;
    // Можно написать метод в сервисе, который вернёт все результаты данного userId
    return this.resultService.getAllResultsOfUser(userId);
  }

  /**
   * Пример (необязательный) — получить все результаты по конкретному тесту
   * (Только admin или автор квиза)
   * Пример: GET /user-quiz-result/byQuiz/:quizId
   */
  @Get('byQuiz/:quizId')
  @UseGuards(RolesGuard)
  @Roles('admin') // только admin (или добавить доп. логику проверки)
  async getResultsByQuiz(@Param('quizId') quizId: string) {
    // здесь, например, возвращаем список всех результатов для данного quiz
    return this.resultService.getAllResultsOfQuiz(quizId);
  }
}
