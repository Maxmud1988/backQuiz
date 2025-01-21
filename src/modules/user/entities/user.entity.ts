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
    description: 'Пароль пользователя',
    example: 'hashed_password',
  })
  @ApiHideProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hash: string;

  @ApiProperty({
    description: 'refresh_token пользователя',
    example: 'hashed_refresh_token',
  })
  // @ApiHideProperty()
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hashRt: string;

  // Связь один-ко-многим (один User -> много Quiz)
  @HasMany(() => Quiz)
  quizzes: Quiz[];
}
