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
  isPublic: boolean; // можно скрывать/открывать квиз для других

  @ApiProperty({ example: '2cf458ee-6a8f-4fc2-9f06-7af7ca2a5f22' })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  authorId: string;

  // ТАЙМЕР (сколько секунд даётся на прохождение теста)
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

  // РАНДОМИЗАЦИЯ
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

  // ПОКАЗЫВАТЬ ЛИ ПРАВИЛЬНЫЕ ОТВЕТЫ ПОСЛЕ ТЕСТА
  @ApiProperty({ example: true })
  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  showCorrectAnswers: boolean;

  // ОГРАНИЧЕНИЕ ПО ЧИСЛУ ПОПЫТОК
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
