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
import { Question } from 'src/modules/question/entities/question.entity';

// Можно использовать общий enum модерации, но здесь определим отдельно для Option
export enum OptionModerationStatus {
  PENDING = 'pending', // Только создан, автоматическая проверка ещё не выполнена
  AUTO_APPROVED = 'auto_approved', // Прошел автоматическую проверку
  PENDING_MANUAL_REVIEW = 'pending_manual_review', // Требует ручной проверки
  APPROVED = 'approved', // Окончательно одобрен модератором
  REJECTED = 'rejected', // Отклонён
}

@Table({ tableName: 'options' })
export class Option extends Model<Option> {
  @ApiProperty({
    description: 'Уникальный идентификатор варианта ответа',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ example: 'Вариант ответа 1' })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  text: string;

  @ApiProperty({ example: false })
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isCorrect: boolean;

  @ForeignKey(() => Question)
  @Column({ type: DataType.UUID, allowNull: false })
  questionId: string;

  @BelongsTo(() => Question, 'questionId')
  question: Question;

  // Дополнительные поля для модерации варианта ответа:

  @ApiProperty({
    description: 'Статус модерации варианта ответа',
    example: OptionModerationStatus.PENDING,
  })
  @Default(OptionModerationStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(OptionModerationStatus)),
    allowNull: false,
  })
  moderationStatus: OptionModerationStatus;

  @ApiProperty({
    description: 'Дата одобрения варианта ответа',
    example: '2023-02-14T12:34:56.789Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approvedAt?: Date;

  @ApiProperty({
    description: 'Флаг архивированности варианта ответа',
    example: false,
  })
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isArchived: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
