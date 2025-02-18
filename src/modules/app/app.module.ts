import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configure from '../../config/AppConfiguration';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from '../auth/auth.module';
import { Quiz } from '../quiz/entities/quiz.entity';
import { Question } from '../question/entities/question.entity';
import { UserQuestionAnswer } from '../user-question-answer/entities/user-question-answer.entity';

import { Option } from '../option/entities/option.entity';
import { UserQuizResult } from '../user-quiz-result/entities/user-quiz-result.entity';
import { QuizModule } from '../quiz/quiz.module';
import { QuestionModule } from '../question/question.module';
import { OptionModule } from '../option/option.module';
import { UserQuizResultModule } from '../user-quiz-result/user-quiz-result.module';
import { UserQuestionAnswerModule } from '../user-question-answer/user-question-answer.module';
import { DashboardModule } from '../dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configure],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDevelopment =
          configService.get<string>('nodeEnv') === 'development';
        return {
          dialect: 'postgres',
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.name'),
          autoLoadModels: true,
          synchronize: isDevelopment,
          logging: isDevelopment ? console.log : false, // Включение логирования
          models: [
            User,
            Quiz,
            Question,
            Option,
            UserQuizResult,
            UserQuestionAnswer,
          ],
        };
      },
    }),
    AuthModule,
    UserModule,
    QuizModule,
    QuestionModule,
    OptionModule,
    UserQuizResultModule,
    UserQuestionAnswerModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
