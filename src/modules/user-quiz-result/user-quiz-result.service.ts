import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
// DTO (если нужно для start/finish)
// import { StartQuizDto } from './dto/start-quiz.dto'; // пример, если у вас есть
// import { FinishQuizDto } from './dto/finish-quiz.dto'; // пример
import { UserQuizResult } from './entities/user-quiz-result.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';
import { UserQuestionAnswer } from '../user-question-answer/entities/user-question-answer.entity';

@Injectable()
export class UserQuizResultService {
  constructor(
    @InjectModel(UserQuizResult) private resultRepo: typeof UserQuizResult,
    @InjectModel(Quiz) private quizRepo: typeof Quiz,
    @InjectModel(Question) private questionRepo: typeof Question,
    @InjectModel(Option) private optionRepo: typeof Option,
    @InjectModel(UserQuestionAnswer)
    private answerRepo: typeof UserQuestionAnswer,
  ) {}

  /**
   * Запустить попытку прохождения теста (Quiz).
   * - Проверяем, есть ли лимит попыток.
   * - При необходимости генерируем случайный порядок вопросов/вариантов.
   * - Сохраняем serializedQuestions (опционально).
   * - Создаём запись UserQuizResult со статусом "in_progress".
   */
  async startQuiz(quizId: string, userId: string) {
    // 1) Находим Quiz
    const quiz = await this.quizRepo.findByPk(quizId, {
      include: [Question], // чтобы сразу получить список вопросов
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // 2) Проверяем кол-во попыток
    if (quiz.attemptsAllowed !== null) {
      const count = await this.resultRepo.count({
        where: { quizId, userId },
      });
      if (count >= quiz.attemptsAllowed) {
        throw new ForbiddenException('No attempts left for this quiz');
      }
    }

    // 3) Рандомизация вопросов (если shuffleQuestions = true)
    let questionsArr = quiz.questions || [];
    if (quiz.shuffleQuestions) {
      questionsArr = this.shuffleArray(questionsArr);
    }

    // Опционально подгружаем варианты у каждого вопроса
    const questionsWithOptions = [];
    for (const q of questionsArr) {
      const options = await this.optionRepo.findAll({
        where: { questionId: q.id },
      });
      let finalOptions = options;
      if (quiz.shuffleOptions) {
        finalOptions = this.shuffleArray(options);
      }
      questionsWithOptions.push({
        questionId: q.id,
        text: q.text,
        type: q.type,
        score: q.score,
        options: finalOptions.map((opt) => ({
          id: opt.id,
          text: opt.text,
          isCorrect: opt.isCorrect, // можно скрывать isCorrect, если нужно
        })),
      });
    }

    // 4) Сериализуем в JSON (если хотим зафиксировать порядок)
    const serialized = JSON.stringify(questionsWithOptions);

    // 5) Создаем запись UserQuizResult
    const newResult = await this.resultRepo.create({
      quizId,
      userId,
      startedAt: new Date(),
      score: 0,
      maxScore: 0,
      // сохраняем поле serializedQuestions (нужно добавить в модель user-quiz-result)
      serializedQuestions: serialized,
    });

    // Возвращаем либо сам result, либо отдельную структуру
    return {
      userQuizResultId: newResult.id,
      questions: questionsWithOptions,
    };
  }

  /**
   * Завершить попытку (Quiz): проверить таймер, подсчитать score, зафиксировать finishedAt.
   */
  async finishQuiz(resultId: string, userId: string) {
    // 1) Ищем запись UserQuizResult
    const result = await this.resultRepo.findByPk(resultId, {
      include: [Quiz], // нужно, чтобы узнать timeLimit, showCorrectAnswers, etc.
    });
    if (!result) {
      throw new NotFoundException('UserQuizResult not found');
    }
    if (result.userId !== userId) {
      throw new ForbiddenException('Not your quiz attempt');
    }

    const quiz = result.quiz;
    if (!quiz) {
      throw new NotFoundException('Associated quiz not found');
    }

    // 2) Проверяем таймер, если timeLimit не нулевой
    if (quiz.timeLimit) {
      const now = new Date();
      const elapsedSec = (now.getTime() - result.startedAt.getTime()) / 1000;
      if (elapsedSec > quiz.timeLimit) {
        // Например, ставим 0 баллов
        result.score = 0;
        result.finishedAt = now;
        await result.save();
        return {
          message: 'Time limit exceeded; your score is 0',
          result,
        };
      }
    }

    // 3) Подсчет итогового score
    //   3.1. Загружаем ответы пользователя (UserQuestionAnswer)
    const userAnswers = await this.answerRepo.findAll({
      where: { userQuizResultId: resultId },
      include: [Question], // чтобы знать type, score, etc.
    });

    let totalScore = 0;
    let maxScore = 0;

    // 3.2. Для каждого ответа — считаем баллы
    for (const ans of userAnswers) {
      const question = ans.question;
      if (!question) continue;

      // Найдем все опции вопроса (чтобы знать isCorrect)
      const questionOptions = await this.optionRepo.findAll({
        where: { questionId: question.id },
      });

      const questionMax = question.score || 1; // балл вопроса (по умолч. 1)
      let questionObtained = 0; // сколько баллов user получает

      // Логика подсчёта
      if (question.type === 'single_choice') {
        questionObtained = this.calcSingleChoice(
          questionOptions,
          ans.chosenOptionIds,
          questionMax,
        );
      } else if (question.type === 'multiple_choice') {
        questionObtained = this.calcMultipleChoice(
          questionOptions,
          ans.chosenOptionIds,
          questionMax,
        );
      } else if (question.type === 'text') {
        // доп. логика, если текст проверяется автоматически, либо вручную => ans.score
        // если ручная проверка — вы можете хранить ans.score, проставленную преподавателем
        questionObtained = ans.score || 0;
      } else {
        // 'ordering', 'matching', etc. - своя логика
        questionObtained = 0;
      }

      totalScore += questionObtained;
      maxScore += questionMax;
    }

    // 4) Сохраняем результат
    result.score = totalScore;
    result.maxScore = maxScore;
    result.finishedAt = new Date();
    await result.save();

    // 5) Если quiz.showCorrectAnswers = true, можем вернуть список правильных ответов
    let correctAnswers = null;
    if (quiz.showCorrectAnswers) {
      correctAnswers = await this.getCorrectAnswers(quiz.id);
    }

    return {
      result,
      correctAnswers,
    };
  }

  /**
   * Пример метода, чтобы администратор/автор видел результаты
   */
  async getResultById(resultId: string) {
    return this.resultRepo.findByPk(resultId, {
      include: [Quiz],
    });
  }

  /**
   * Пример функции подсчёта для single_choice (если в chosenOptionIds один элемент)
   */
  private calcSingleChoice(
    questionOptions: Option[],
    chosenOptionIds: string[] | null,
    questionMax: number,
  ): number {
    if (!chosenOptionIds || chosenOptionIds.length === 0) {
      return 0;
    }
    const chosenId = chosenOptionIds[0];
    // Найдём опцию, является ли она правильной
    const found = questionOptions.find((o) => o.id === chosenId);
    if (found && found.isCorrect) {
      return questionMax;
    }
    return 0;
  }

  /**
   * Пример функции подсчёта для multiple_choice (частичное оценивание)
   */
  private calcMultipleChoice(
    questionOptions: Option[],
    chosenOptionIds: string[] | null,
    questionMax: number,
  ): number {
    if (!chosenOptionIds || chosenOptionIds.length === 0) {
      return 0;
    }
    const correctOpts = questionOptions.filter((o) => o.isCorrect);
    const totalCorrectCount = correctOpts.length;

    // Сколько правильных опций выбрал пользователь
    const chosenCorrectCount = correctOpts.filter((opt) =>
      chosenOptionIds.includes(opt.id),
    ).length;
    // Сколько неверных опций выбрал пользователь
    const chosenWrongCount = questionOptions.filter(
      (o) => !o.isCorrect && chosenOptionIds.includes(o.id),
    ).length;

    // Простейшая логика: partial ratio
    let ratio = chosenCorrectCount / totalCorrectCount;
    // Например, если пользователь выбрал хоть одну неверную — обнуляем,
    // или вычитаем penalty:
    if (chosenWrongCount > 0) {
      // ratio = 0; // жёстко
      ratio -= chosenWrongCount * 0.2; // или мягкий штраф
      if (ratio < 0) ratio = 0;
    }

    return ratio * questionMax;
  }

  /**
   * Получить "правильные ответы" для квиза (если quiz.showCorrectAnswers=true)
   */
  private async getCorrectAnswers(quizId: string) {
    const questions = await this.questionRepo.findAll({
      where: { quizId },
      include: [Option],
    });
    const data = questions.map((q) => {
      const correctOptionIds = q.options
        .filter((opt) => opt.isCorrect)
        .map((opt) => opt.id);
      return {
        questionId: q.id,
        correctOptionIds,
      };
    });
    return data;
  }

  /**
   * Простая функция для перемешивания массива (Fisher-Yates)
   */
  private shuffleArray<T>(arr: T[]): T[] {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async getAllResultsOfUser(userId: string) {
    return this.resultRepo.findAll({
      where: { userId },
      include: [Quiz], // Подключаем связанный тест, если нужно
      order: [['createdAt', 'DESC']], // Сортировка по дате создания
    });
  }
  /**
   * Получить все результаты по конкретному тесту.
   * Только для администратора или автора теста.
   * @param quizId - ID теста
   */
  async getAllResultsOfQuiz(quizId: string) {
    return this.resultRepo.findAll({
      where: { quizId },
      include: [Quiz], // Подключаем связанный тест, если нужно
      order: [['createdAt', 'DESC']], // Сортировка по дате создания
    });
  }
}
