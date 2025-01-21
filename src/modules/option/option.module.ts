import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OptionService } from './option.service';
import { OptionController } from './option.controller';
import { Option } from './entities/option.entity';
import { Question } from '../question/entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';

@Module({
  imports: [SequelizeModule.forFeature([Option, Question, Quiz])],
  controllers: [OptionController],
  providers: [OptionService],
  exports: [OptionService],
})
export class OptionModule {}
