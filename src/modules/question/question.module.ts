import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { Question } from './entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';

@Module({
  imports: [SequelizeModule.forFeature([Question, Quiz])],
  controllers: [QuestionController],
  providers: [QuestionService],
  exports: [QuestionService],
})
export class QuestionModule {}
