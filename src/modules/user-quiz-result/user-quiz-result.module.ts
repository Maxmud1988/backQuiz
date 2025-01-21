import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserQuizResultService } from './user-quiz-result.service';
import { UserQuizResultController } from './user-quiz-result.controller';
import { UserQuizResult } from './entities/user-quiz-result.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';
import { UserQuestionAnswer } from '../user-question-answer/entities/user-question-answer.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserQuizResult,
      Quiz,
      Question,
      Option,
      UserQuestionAnswer,
    ]),
  ],
  controllers: [UserQuizResultController],
  providers: [UserQuizResultService],
  exports: [UserQuizResultService],
})
export class UserQuizResultModule {}
