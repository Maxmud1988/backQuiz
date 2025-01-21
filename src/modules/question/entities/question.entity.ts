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
  HasMany,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Quiz } from 'src/modules/quiz/entities/quiz.entity';
import { Option } from 'src/modules/option/entities/option.entity';

@Table({ tableName: 'questions' })
export class Question extends Model<Question> {
  @ApiProperty()
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ example: 'Какой из вариантов правильный?' })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  text: string;

  @ApiProperty({
    description: 'Тип вопроса',
    example: 'single_choice',
  })
  @Default('single_choice')
  @Column({
    type: DataType.ENUM(
      'single_choice',
      'multiple_choice',
      'text',
      'ordering',
      'matching',
    ),
    allowNull: false,
  })
  type: string;

  @ApiProperty({ example: 1 })
  @Default(1)
  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    comment: 'Количество баллов за вопрос',
  })
  score: number;

  @ForeignKey(() => Quiz)
  @Column({ type: DataType.UUID, allowNull: false })
  quizId: string;

  @BelongsTo(() => Quiz, 'quizId')
  quiz: Quiz;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @HasMany(() => Option)
  options: Option[];
}
