import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SigninDto, SignupDto } from './dto';
import { Tokens } from './types/tokens.type';
import { Role } from '../user/Enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private userService: UserService,
  ) {}

  // Регистрация пользователя
  async signup(dto: SignupDto): Promise<Tokens> {
    // Проверка наличия пользователя с таким email
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ForbiddenException('Email уже используется');
    }

    // Создание пользователя
    const user = await this.userService.create({
      email: dto.email,
      username: dto.username,
      hash: dto.password,
      role: Role.USER,
    });

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.username,
    );
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  // Вход пользователя
  async signin(dto: SigninDto): Promise<Tokens> {
    const user = await this.userService.findByEmail(dto.email);
    if (!user || !user.hash) {
      throw new ForbiddenException('Неверные учетные данные');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.hash);
    if (!passwordMatches) {
      throw new ForbiddenException('Неверные учетные данные');
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.username,
    );
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  // Выход пользователя
  async logout(userId: string): Promise<boolean> {
    await this.userService.update(userId, { hashRt: null });
    return true;
  }

  // Обновление токенов
  async refreshTokens(userId: string, refreshToken: string): Promise<Tokens> {
    const user = await this.userService.findById(userId);
    if (!user || !user.hashRt) throw new ForbiddenException('Доступ запрещен');

    const rtMatches = await bcrypt.compare(refreshToken, user.hashRt);
    if (!rtMatches) throw new ForbiddenException('Доступ запрещен');

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.username,
    );
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  // Валидация OAuth логина
  async validateOAuthLogin(
    email: string,
    username: string,
    provider: string,
  ): Promise<Tokens> {
    console.log('Email in validateOAuthLogin:', email);
    if (!email) {
      throw new Error('Email is required');
    }
    let user = await this.userService.findByEmail(email);
    if (!user) {
      // Создание нового пользователя
      user = await this.userService.create({
        email,
        username,
        hash: null, // Пароль отсутствует
        role: Role.USER,
      });
    }

    const tokens = await this.getTokens(
      user.id,
      user.email,
      user.role,
      user.username,
    );
    console.log(tokens);
    await this.updateRtHash(user.id, tokens.refresh_token);
    return tokens;
  }

  // Получение токенов
  async getTokens(
    userId: string,
    email: string,
    role: string,
    username: string,
  ): Promise<Tokens> {
    const jwtPayload = {
      sub: userId,
      email,
      role,
      username,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('jwt.accest_secret'),
        expiresIn: '15m',
      }),

      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('jwt.refresh_secret'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
  // Обновление хеша refresh token
  async updateRtHash(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userService.update(userId, { hashRt: hash });
  }
}
