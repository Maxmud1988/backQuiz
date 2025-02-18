// src/question/question.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateQuestionDto } from './dto/create-question.dto';
import { Question, ModerationStatus } from './entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Role } from '../user/Enums/role.enum';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question) private questionRepo: typeof Question,
    @InjectModel(Quiz) private quizRepo: typeof Quiz,
  ) {}

  async createQuestion(
    dto: CreateQuestionDto,
    quizId: string,
    userId: string,
    userRole: Role,
  ): Promise<Question> {
    // Проверяем, что Quiz существует
    const quiz = await this.quizRepo.findByPk(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');

    // Проверяем, что userId равен quiz.authorId, либо userRole == admin
    if (quiz.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'No permission to add question to this quiz',
      );
    }

    // Определяем статус модерации с помощью автоматической проверки
    const autoModerationPassed = await this.autoModerateQuestion(dto);
    const moderationStatus = autoModerationPassed
      ? ModerationStatus.AUTO_APPROVED
      : ModerationStatus.PENDING_MANUAL_REVIEW;

    // Создаем вопрос с установленным статусом модерации
    const question = await this.questionRepo.create({
      text: dto.text,
      type: dto.type,
      score: dto.score ?? 1,
      quizId: quizId,
      moderationStatus: moderationStatus,
    });

    return question;
  }

  /**
   * Простейшая автоматическая проверка вопроса.
   * Если текст вопроса содержит запрещенные слова – возвращается false.
   */
  private async autoModerateQuestion(dto: CreateQuestionDto): Promise<boolean> {
    // Пример: список запрещенных слов (его можно расширить или заменить более сложной логикой)
    const forbiddenWords = ['badword1', 'badword2'];
    for (const word of forbiddenWords) {
      if (dto.text.toLowerCase().includes(word)) {
        return false;
      }
    }
    return true;
  }

  // ... CRUD методы: findAll, findOne, update, remove (оставляем без изменений)
}
