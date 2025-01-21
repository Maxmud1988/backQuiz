import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { Quiz } from './entities/quiz.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([Quiz]),
    // Если планируете внутри QuizService оперировать Question,
    // можно сразу добавить Question сюда
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {}
