// src/modules/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../user/entities/user.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Question } from '../question/entities/question.entity';
import { Option } from '../option/entities/option.entity';
import { UserQuizResult } from '../user-quiz-result/entities/user-quiz-result.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Quiz, Question, Option, UserQuizResult]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
