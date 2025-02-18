import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Role } from '../Enums/role.enum';
import { Quiz } from 'src/modules/quiz/entities/quiz.entity';

@Table
export class User extends Model<User> {
  @ApiProperty({
    description: 'Уникальный идентификатор пользователя',
    example: 'b23fa8c0-2b6f-4a2f-b5b8-ecb76d3a29b0',
  })
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ApiProperty({ description: 'Роль пользователя', example: 'user' })
  @Column({
    type: DataType.ENUM(...Object.values(Role)),
    allowNull: false,
    defaultValue: Role.USER,
  })
  role: Role;

  @ApiProperty({
    description: 'Электронная почта пользователя',
    example: 'user@example.com',
  })
  @Column({
    type: DataType.STRING,
    unique: true,
    allowNull: false,
  })
  email: string;

  @ApiProperty({ description: 'Имя пользователя', example: 'user123' })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  username?: string;

  @ApiProperty({
    description: 'Пароль пользователя (хранится в зашифрованном виде)',
    example: 'hashed_password',
  })
  @ApiHideProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hash: string;

  @ApiProperty({
    description: 'Refresh token пользователя',
    example: 'hashed_refresh_token',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hashRt: string;

  // Новые поля для админ-панели:

  @ApiProperty({
    description: 'Флаг блокировки пользователя',
    example: false,
  })
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  isBlocked: boolean;

  @ApiProperty({
    description: 'Дата и время последнего входа пользователя',
    example: '2023-02-14T12:34:56.789Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLogin?: Date;

  // Timestamps (если не добавляются автоматически)
  @ApiProperty({
    description: 'Дата создания пользователя',
    example: '2023-01-01T00:00:00.000Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата последнего обновления данных пользователя',
    example: '2023-01-15T12:00:00.000Z',
  })
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  updatedAt: Date;

  // Связь один-ко-многим (один User -> много Quiz)
  @HasMany(() => Quiz)
  quizzes: Quiz[];
}
