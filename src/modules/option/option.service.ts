import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { CreateOptionDto } from './dto/create-option.dto';
import { UpdateOptionDto } from './dto/update-option.dto';
import { Option } from './entities/option.entity';
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
    // 1. Найти вопрос
    const question = await this.questionRepo.findByPk(questionId, {
      include: [Quiz],
    });
    if (!question) {
      throw new NotFoundException('Question not found');
    }

    // 2. Проверить, принадлежит ли вопрос квизу, созданному текущим пользователем
    //    или текущий пользователь — admin
    if (
      question.quiz.authorId !== currentUserId &&
      currentUserRole !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'You have no permission to add option to this question',
      );
    }

    // 3. Создать вариант ответа
    const option = await this.optionRepo.create({
      ...dto,
      questionId: questionId,
    });
    return option;
  }

  /**
   * Получить все варианты для конкретного вопроса (можно при необходимости)
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

    // Проверяем, что автор Quiz == currentUserId, либо userRole == admin
    if (
      option.question.quiz.authorId !== currentUserId &&
      currentUserRole !== Role.ADMIN
    ) {
      throw new ForbiddenException(
        'You have no permission to update this option',
      );
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
