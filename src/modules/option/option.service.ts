import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { Option, OptionModerationStatus } from './entities/option.entity';
import { Question } from '../question/entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Role } from '../user/Enums/role.enum';

@Injectable()
export class OptionService {
  constructor(
    @InjectModel(Option) private optionRepo: typeof Option,
    @InjectModel(Question) private questionRepo: typeof Question,
    @InjectModel(Quiz) private quizRepo: typeof Quiz,
  ) {}

  /**
   * Создать новый вариант ответа (Option)
   */
  async createOption(
    questionId: string,
    dto: CreateOptionDto,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<Option> {
    // 1. Найти вопрос с включением Quiz
    const question = await this.questionRepo.findByPk(questionId, {
      include: [Quiz],
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // 2. Проверить, принадлежит ли вопрос квизу, созданному текущим пользователем или userRole === admin
    if (
      question.quiz.authorId !== currentUserId &&
      currentUserRole !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'You have no permission to add option to this question',
      );
    }

    // 3. Автоматическая проверка варианта ответа (например, проверка текста на запрещенные слова)
    const autoModerationPassed = await this.autoModerateOption(dto);
    const moderationStatus = autoModerationPassed
      ? OptionModerationStatus.AUTO_APPROVED
      : OptionModerationStatus.PENDING_MANUAL_REVIEW;

    // 4. Создать вариант ответа с установленным статусом модерации
    const option = await this.optionRepo.create({
      ...dto,
      questionId: questionId,
      moderationStatus,
    });
    return option;
  }

  /**
   * Простейшая автоматическая проверка текста варианта ответа.
   * Если текст содержит запрещенные слова, возвращает false.
   */
  private async autoModerateOption(dto: CreateOptionDto): Promise<boolean> {
    const forbiddenWords = ['badword1', 'badword2'];
    for (const word of forbiddenWords) {
      if (dto.text.toLowerCase().includes(word)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Получить все варианты для конкретного вопроса
   */
  async findAll(questionId: string): Promise<Option[]> {
    return this.optionRepo.findAll({
      where: { questionId },
    });
  }

  /**
   * Получить конкретный вариант ответа
   */
  async findOne(id: string): Promise<Option> {
    const option = await this.optionRepo.findByPk(id, {
      include: [
        {
          model: Question,
          include: [Quiz],
        },
      ],
    });
    if (!option) {
      throw new NotFoundException('Option not found');
    }
    return option;
  }

  /**
   * Обновить вариант ответа
   */
  async updateOption(
    id: string,
    dto: UpdateOptionDto,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<Option> {
    const option = await this.findOne(id);

    if (
      option.question.quiz.authorId !== currentUserId &&
      currentUserRole !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'You have no permission to update this option',
      );
    }

    // Если текст обновляется, перезапускаем автоматическую проверку
    if (dto.text !== undefined) {
      const autoModerationPassed = await this.autoModerateOption({
        text: dto.text,
      } as CreateOptionDto);
      dto['moderationStatus'] = autoModerationPassed
        ? OptionModerationStatus.AUTO_APPROVED
        : OptionModerationStatus.PENDING_MANUAL_REVIEW;
    }

    await option.update({ ...dto });
    return option;
  }

  /**
   * Удалить вариант ответа
   */
  async removeOption(id: string, currentUserId: string, currentUserRole: Role) {
    const option = await this.findOne(id);

    if (
      option.question.quiz.authorId !== currentUserId &&
      currentUserRole !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'You have no permission to remove this option',
      );
    }
    await option.destroy();
    return { message: 'Option deleted successfully' };
  }
}
