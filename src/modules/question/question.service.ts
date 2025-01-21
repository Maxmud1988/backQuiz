import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';

import { InjectModel } from '@nestjs/sequelize';
import { Question } from './entities/question.entity';
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
  ) {
    // проверяем, что Quiz существует
    const quiz = await this.quizRepo.findByPk(quizId);
    if (!quiz) throw new NotFoundException('Quiz not found');

    // проверяем, что userId == quiz.authorId, либо userRole == admin
    if (quiz.authorId !== userId && userRole !== Role.ADMIN) {
      throw new ForbiddenException(
        'No permission to add question to this quiz',
      );
    }

    // создаём вопрос
    const question = await this.questionRepo.create({
      text: dto.text,
      type: dto.type,
      score: dto.score ?? 1,
      quizId: quizId,
    });

    return question;
  }

  // ...CRUD методы: findAll, findOne, update, remove
}
