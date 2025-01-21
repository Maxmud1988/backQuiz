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
import { User } from 'src/modules/user/entities/user.entity';
import { Quiz } from 'src/modules/quiz/entities/quiz.entity';

@Table({ tableName: 'user_quiz_results' })
export class UserQuizResult extends Model<UserQuizResult> {
  @ApiProperty()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId: string;

  @BelongsTo(() => User, 'userId')
  user: User;

  @ForeignKey(() => Quiz)
  @Column({ type: DataType.UUID, allowNull: false })
  quizId: string;

  @BelongsTo(() => Quiz, 'quizId')
  quiz: Quiz;

  @ApiProperty({ example: 5 })
  @Default(0)
  @Column({ type: DataType.FLOAT, allowNull: false })
  score: number;

  @ApiProperty({ example: 10 })
  @Default(0)
  @Column({ type: DataType.FLOAT, allowNull: false })
  maxScore: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    comment: 'Сериализованные вопросы (order, shuffled options), если нужно',
  })
  serializedQuestions: any;

  @ApiProperty()
  @Column({ type: DataType.DATE, allowNull: true })
  startedAt: Date;

  @ApiProperty()
  @Column({ type: DataType.DATE, allowNull: true })
  finishedAt: Date;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
