import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserQuestionAnswerService } from './user-question-answer.service';
import { UserQuestionAnswerController } from './user-question-answer.controller';
import { UserQuestionAnswer } from './entities/user-question-answer.entity';
import { UserQuizResult } from '../user-quiz-result/entities/user-quiz-result.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([
      UserQuestionAnswer,
      UserQuizResult,
      Question,
      Option,
    ]),
  ],
  controllers: [UserQuestionAnswerController],
  providers: [UserQuestionAnswerService],
  exports: [UserQuestionAnswerService],
})
export class UserQuestionAnswerModule {}
