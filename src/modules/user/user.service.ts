// src/users/user.service.ts
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import {
  ChangePasswordDto,
  CreateUserDto,
  SetPasswordDto,
  UpdateUserDto,
  UpdateUserRoleDto,
} from './dto';
import { Op } from 'sequelize';
import { Role } from './Enums/role.enum';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(@InjectModel(User) private userModel: typeof User) {}

  async create(data: CreateUserDto): Promise<User> {
    // Проверка, нет ли пользователя с таким email
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хеширование пароля, если он передан
    let hashedPassword = null;
    if (data.hash) {
      if (typeof data.hash !== 'string') {
        throw new Error('Пароль должен быть строкой');
      }
      hashedPassword = await bcrypt.hash(data.hash, 10);
    }

    // Установка роли по умолчанию, если не указана
    if (!data.role) {
      data.role = Role.USER;
    }

    // Создаём пользователя
    const newUser = await this.userModel.create({
      ...data,
      hash: hashedPassword,
    });

    // Возвращаем "очищенные" данные
    const { id, email, username, role, isBlocked, lastLogin } = newUser;
    return { id, email, username, role, isBlocked, lastLogin } as User;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      return null;
    }
    return user;
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    // Если email передан, проверяем его уникальность
    if (updateUserDto.email) {
      const existingUser = await this.userModel.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email is already in use');
      }
    }
    await this.userModel.update(updateUserDto, { where: { id: userId } });
    return this.findById(userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.findById(userId);
    if (!user.hash) {
      throw new BadRequestException('У вас не установлен пароль');
    }
    const passwordMatches = await bcrypt.compare(
      dto.currentPassword,
      user.hash,
    );
    if (!passwordMatches) {
      throw new ForbiddenException('Текущий пароль указан неверно');
    }
    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.update({ hash: newHash }, { where: { id: userId } });
  }

  async updateUserRole(userId: string, dto: UpdateUserRoleDto): Promise<User> {
    await this.userModel.update({ role: dto.role }, { where: { id: userId } });
    return this.findById(userId);
  }

  // Новый метод для обновления статуса блокировки пользователя
  async updateUserStatus(userId: string, isBlocked: boolean): Promise<User> {
    await this.userModel.update({ isBlocked }, { where: { id: userId } });
    return this.findById(userId);
  }

  async findAll(page: number, limit: number, searchQuery?: string) {
    const offset = (page - 1) * limit;
    const whereCondition = searchQuery
      ? {
          [Op.or]: [
            { username: { [Op.iLike]: `%${searchQuery}%` } },
            { email: { [Op.iLike]: `%${searchQuery}%` } },
          ],
        }
      : {};

    return await this.userModel.findAndCountAll({
      where: whereCondition,
      limit,
      offset,
    });
  }

  async update(id: string, data: Partial<User>): Promise<void> {
    await this.userModel.update(data, { where: { id } });
  }

  async setPassword(userId: string, dto: SetPasswordDto): Promise<void> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Пароли не совпадают');
    }
    const user = await this.findById(userId);
    if (user.hash) {
      throw new BadRequestException('Пароль уже установлен');
    }
    const newHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel.update({ hash: newHash }, { where: { id: userId } });
  }

  async remove(userId: string): Promise<void> {
    await this.userModel.destroy({ where: { id: userId } });
  }
}
