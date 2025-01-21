import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserQuestionAnswerDto } from './dto/create-user-question-answer.dto';
import { UpdateUserQuestionAnswerDto } from './dto/update-user-question-answer.dto';
import { UserQuestionAnswer } from './entities/user-question-answer.entity';
import { UserQuizResult } from '../user-quiz-result/entities/user-quiz-result.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity'; // Модель options (isCorrect)

@Injectable()
export class UserQuestionAnswerService {
  constructor(
    @InjectModel(UserQuestionAnswer)
    private answerRepo: typeof UserQuestionAnswer,
    @InjectModel(UserQuizResult)
    private resultRepo: typeof UserQuizResult,
    @InjectModel(Question)
    private questionRepo: typeof Question,
    @InjectModel(Option)
    private optionRepo: typeof Option,
  ) {}

  /**
   * Создать ответ (если ещё не создан) на определённый question
   */
  async submitAnswer(dto: CreateUserQuestionAnswerDto, userId: string) {
    // 1) Проверяем userQuizResult
    const userQuizResult = await this.resultRepo.findByPk(dto.userQuizResultId);
    if (!userQuizResult)
      throw new NotFoundException('UserQuizResult not found');
    if (userQuizResult.userId !== userId) {
      throw new ForbiddenException('Not your attempt');
    }

    // Проверяем, не завершён ли тест (finishedAt != null)
    if (userQuizResult.finishedAt) {
      throw new ForbiddenException('This test attempt is already finished');
    }

    // 2) Проверяем question
    const question = await this.questionRepo.findByPk(dto.questionId);
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // 3) Бизнес-валидация по type
    if (question.type === 'text') {
      // textAnswer — обязателен
      if (!dto.textAnswer || dto.textAnswer.trim().length === 0) {
        throw new BadRequestException(
          'textAnswer is required for text question',
        );
      }
    } else if (question.type === 'single_choice') {
      // chosenOptionIds => ровно 1
      if (!dto.chosenOptionIds || dto.chosenOptionIds.length !== 1) {
        throw new BadRequestException(
          'For single_choice, chosenOptionIds must contain exactly 1 element',
        );
      }
    }

    // 4) Проверяем, нет ли уже ответа
    const existing = await this.answerRepo.findOne({
      where: {
        userQuizResultId: dto.userQuizResultId,
        questionId: dto.questionId,
      },
    });
    if (existing) {
      throw new ForbiddenException(
        'Answer for this question already exists. Use update if needed.',
      );
    }

    // 5) Считаем score (если machine-checkable)
    let calculatedScore = 0;
    if (
      question.type === 'single_choice' ||
      question.type === 'multiple_choice'
    ) {
      // Загружаем опции
      const options = await this.optionRepo.findAll({
        where: { questionId: question.id },
      });
      calculatedScore = this.autoCalculateScore(question, options, dto);
    } else if (question.type === 'text') {
      // Можно 0 или dto.score (вдруг есть автопроверка)
      calculatedScore = 0;
    }

    // 6) Создаём запись ответа
    const answer = await this.answerRepo.create({
      ...dto,
      score: calculatedScore,
    });

    return answer;
  }

  /**
   * Обновить (перезаписать) ответ, если логика позволяет
   */
  async updateAnswer(
    answerId: string,
    dto: UpdateUserQuestionAnswerDto,
    userId: string,
  ) {
    // 1) Найти существующий answer
    const answer = await this.answerRepo.findByPk(answerId, {
      include: [UserQuizResult, Question],
    });
    if (!answer) {
      throw new NotFoundException('Answer not found');
    }

    // Проверяем принадлежность
    if (answer.userQuizResult.userId !== userId) {
      throw new ForbiddenException('Not your attempt');
    }

    // Проверяем, не завершён ли тест
    if (answer.userQuizResult.finishedAt) {
      throw new ForbiddenException('Test is already finished');
    }

    const question = answer.question;

    // 2) Если question.type = text и пользователь передал новый textAnswer = '', проверяем
    if (question.type === 'text' && dto.textAnswer !== undefined) {
      if (!dto.textAnswer || dto.textAnswer.trim().length === 0) {
        throw new BadRequestException(
          'textAnswer is required for text question',
        );
      }
    } else if (
      question.type === 'single_choice' &&
      dto.chosenOptionIds !== undefined
    ) {
      if (!dto.chosenOptionIds || dto.chosenOptionIds.length !== 1) {
        throw new BadRequestException(
          'For single_choice, chosenOptionIds must contain exactly 1 element',
        );
      }
    }

    // 3) Пересчитываем score, если меняются chosenOptionIds/textAnswer
    let newScore = answer.score;
    let doRecalc = false;

    // если пользователь меняет chosenOptionIds или textAnswer, надо пересчитать
    if (dto.chosenOptionIds !== undefined || dto.textAnswer !== undefined) {
      doRecalc = true;
    }

    if (doRecalc) {
      if (
        question.type === 'single_choice' ||
        question.type === 'multiple_choice'
      ) {
        const options = await this.optionRepo.findAll({
          where: { questionId: question.id },
        });
        newScore = this.autoCalculateScore(question, options, {
          chosenOptionIds: dto.chosenOptionIds ?? answer.chosenOptionIds,
          textAnswer: dto.textAnswer ?? answer.textAnswer,
        });
      } else if (question.type === 'text') {
        newScore = 0; // или dto.score, если разрешаем
      }
    }

    // 4) Обновляем запись
    await answer.update({
      ...dto,
      score: newScore,
    });

    return answer;
  }

  /**
   * Метод авторасчёта для single/multiple choice
   */
  private autoCalculateScore(
    question: Question,
    options: Option[],
    payload: { chosenOptionIds?: string[]; textAnswer?: string },
  ): number {
    const questionMax = question.score || 1;

    if (question.type === 'single_choice') {
      if (!payload.chosenOptionIds || payload.chosenOptionIds.length !== 1) {
        return 0;
      }
      const chosenId = payload.chosenOptionIds[0];
      const chosenOpt = options.find((o) => o.id === chosenId);
      return chosenOpt && chosenOpt.isCorrect ? questionMax : 0;
    }

    if (question.type === 'multiple_choice') {
      if (!payload.chosenOptionIds) return 0;

      const correctOptions = options.filter((o) => o.isCorrect);
      const correctCount = correctOptions.length;

      const chosenCorrect = correctOptions.filter((o) =>
        payload.chosenOptionIds.includes(o.id),
      ).length;
      const chosenWrong = options.filter(
        (o) => !o.isCorrect && payload.chosenOptionIds.includes(o.id),
      ).length;

      let ratio = chosenCorrect / correctCount;
      // штраф за неверные
      if (chosenWrong > 0) {
        ratio -= chosenWrong * 0.2;
        if (ratio < 0) ratio = 0;
      }
      return ratio * questionMax;
    }

    return 0;
  }
}
