import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz } from './entities/quiz.entity';
import { Role } from '../user/Enums/role.enum';
import { Question } from '../question/entities/question.entity';

@Injectable()
export class QuizService {
  constructor(@InjectModel(Quiz) private quizRepo: typeof Quiz) {}

  async createQuiz(dto: CreateQuizDto, userId: string): Promise<Quiz> {
    // Создаем квиз, указываем authorId = userId
    const quiz = await this.quizRepo.create({
      ...dto,
      authorId: userId,
    });
    return quiz;
  }

  async findAll(): Promise<Quiz[]> {
    return this.quizRepo.findAll();
  }

  async findOne(id: string): Promise<Quiz> {
    const quiz = await this.quizRepo.findByPk(id);
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }
  async findAllByQuizId(id: string): Promise<Quiz> {
    const quiz = await this.quizRepo.findByPk(id, {
      include: [{ model: Question }],
    });
    if (!quiz) {
      throw new NotFoundException('quiz not found');
    }
    return quiz;
  }

  async updateQuiz(
    id: string,
    dto: UpdateQuizDto,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<Quiz> {
    const quiz = await this.findOne(id);

    // Проверяем владельца, если текущий пользователь - не админ
    if (quiz.authorId !== currentUserId && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You cannot update someone else’s quiz');
    }

    await quiz.update(dto);
    return quiz;
  }

  async removeQuiz(id: string, currentUserId: string, currentUserRole: Role) {
    const quiz = await this.findOne(id);

    // Проверяем владельца, если текущий пользователь - не админ
    if (quiz.authorId !== currentUserId && currentUserRole !== Role.ADMIN) {
      throw new ForbiddenException('You cannot delete someone else’s quiz');
    }

    await quiz.destroy();
    return { message: 'Quiz deleted successfully' };
  }
}
