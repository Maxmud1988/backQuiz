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

export enum ModerationStatus {
  PENDING = 'pending', // вопрос только создан, автоматическая проверка ещё не выполнена
  AUTO_APPROVED = 'auto_approved', // вопрос прошёл автоматическую проверку
  PENDING_MANUAL_REVIEW = 'pending_manual_review', // обнаружены подозрительные элементы, требуется ручная проверка
  APPROVED = 'approved', // окончательно одобрен модератором
  REJECTED = 'rejected', // отклонён
}

@Table({ tableName: 'questions' })
export class Question extends Model<Question> {
  @ApiProperty({ example: 'b23fa8c0-2b6f-4a2f-b5b8-ecb76d3a29b0' })
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

  // Поля модерации и управления контентом:

  @ApiProperty({
    description: 'Статус модерации вопроса (гибридная модель)',
    example: ModerationStatus.PENDING,
  })
  @Default(ModerationStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(ModerationStatus)),
    allowNull: false,
  })
  moderationStatus: ModerationStatus;

  @ApiProperty({
    description: 'Дата одобрения вопроса',
    example: '2023-02-14T12:34:56.789Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approvedAt?: Date;

  @ApiProperty({
    description: 'Флаг архивированности вопроса',
    example: false,
  })
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isArchived: boolean;

  @ApiProperty({ description: 'Порядок вопроса в квизе', example: 1 })
  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order: number;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @HasMany(() => Option)
  options: Option[];
}
