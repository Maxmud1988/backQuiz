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

@Table({ tableName: 'options' })
export class Option extends Model<Option> {
  @ApiProperty()
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

  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;
}
