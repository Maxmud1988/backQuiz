import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { UserQuizResult } from 'src/modules/user-quiz-result/entities/user-quiz-result.entity';
import { Question } from 'src/modules/question/entities/question.entity';

@Table({ tableName: 'user_question_answers' })
export class UserQuestionAnswer extends Model<UserQuestionAnswer> {
  @ApiProperty()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => UserQuizResult)
  @Column({ type: DataType.UUID, allowNull: false })
  userQuizResultId: string;

  @BelongsTo(() => UserQuizResult, 'userQuizResultId')
  userQuizResult: UserQuizResult;

  @ForeignKey(() => Question)
  @Column({ type: DataType.UUID, allowNull: false })
  questionId: string;

  @BelongsTo(() => Question, 'questionId')
  question: Question;

  /**
   * Для multiple_choice / single_choice:
   * Здесь храним выбранные варианты (массив ID).
   */
  @ApiProperty({ example: '["opt1", "opt2"]' })
  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Массив выбранных вариантов (если multiple choice) или другое',
  })
  chosenOptionIds: string[];

  /**
   * Для text / essay:
   * Храним свободный текст (по умолчанию null, если не текстовый вопрос).
   */
  @ApiProperty({ example: 'мой ответ' })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Ответ, если вопрос текстовый',
  })
  textAnswer: string;

  /**
   * score за конкретный вопрос.
   * Если question машинно проверяемый (single/multiple), мы можем подсчитать сразу.
   * Если это text/essay - может быть 0 или null (и вручную проверяться преподавателем).
   */
  @ApiProperty({ example: 1 })
  @Default(0)
  @Column({ type: DataType.FLOAT, allowNull: false })
  score: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
