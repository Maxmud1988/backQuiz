import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  HasMany,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/modules/user/entities/user.entity';
import { Question } from 'src/modules/question/entities/question.entity';

// Расширенный enum для гибридной модели модерации
export enum ModerationStatus {
  PENDING = 'pending', // Только создан, автоматическая проверка ещё не выполнена
  AUTO_APPROVED = 'auto_approved', // Прошел автоматическую проверку
  PENDING_MANUAL_REVIEW = 'pending_manual_review', // Обнаружены подозрительные элементы – требуется ручная проверка
  APPROVED = 'approved', // Окончательно одобрен модератором
  REJECTED = 'rejected', // Отклонён
}

@Table({ tableName: 'quizzes' })
export class Quiz extends Model<Quiz> {
  @ApiProperty({ example: '2b24e1c4-281c-4b8a-9c6a-57ae965f22a5' })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ example: 'My Awesome Quiz' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @ApiProperty({ example: 'Some description of the quiz...' })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @ApiProperty({ example: true })
  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isPublic: boolean;

  @ApiProperty({ example: '2cf458ee-6a8f-4fc2-9f06-7af7ca2a5f22' })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  authorId: string;

  @ApiProperty({
    example: 600,
    description: 'Time limit in seconds (e.g. 600 = 10 min)',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Time limit in seconds; if null => no limit',
  })
  timeLimit: number | null;

  @ApiProperty({ example: true, description: 'Randomize question order' })
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  shuffleQuestions: boolean;

  @ApiProperty({ example: true, description: 'Randomize option order' })
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  shuffleOptions: boolean;

  @ApiProperty({ example: true })
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  showCorrectAnswers: boolean;

  @ApiProperty({
    example: 3,
    description: 'Allowed attempts; null => unlimited',
  })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: 'Если не null => кол-во попыток',
  })
  attemptsAllowed: number | null;

  // Поле для гибридной модерации:
  @ApiProperty({
    description: 'Статус модерации квиза (гибридная модель)',
    example: ModerationStatus.PENDING,
  })
  @Default(ModerationStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(ModerationStatus)),
    allowNull: false,
  })
  moderationStatus: ModerationStatus;

  // Дата одобрения квиза (если применимо)
  @ApiProperty({
    description: 'Дата одобрения квиза',
    example: '2023-02-14T12:34:56.789Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approvedAt?: Date;

  // Флаг архивированности квиза (для скрытия без удаления)
  @ApiProperty({
    description: 'Флаг архивированности квиза',
    example: false,
  })
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isArchived: boolean;

  // Дополнительные метрики (например, просмотры)
  @ApiProperty({
    description: 'Количество просмотров квиза',
    example: 100,
  })
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  views: number;

  @BelongsTo(() => User, 'authorId')
  author: User;

  @HasMany(() => Question)
  questions: Question[];

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
