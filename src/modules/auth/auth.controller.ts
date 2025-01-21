// src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Res,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto, SigninDto, Tokens } from './dto';

import { Request, Response } from 'express';
import { AtGuard, GoogleGuard, RtGuard } from './guards';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Регистрация
  @Post('signup')
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно создан',
    type: Tokens, // Указываем тип возвращаемого значения
  })
  @ApiResponse({
    status: 400,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: 403,
    description: 'Email уже используется',
  })
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    // 1. Валидация DTO (class-validator)
    // 2. Вызов сервиса
    const tokens = await this.authService.signup(dto);

    // 3. Записать refreshToken в cookie (httpOnly)
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 4. Возвращаем клиенту access_token
    return { access_token: tokens.access_token };
  }

  // Вход
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(
    @Body() dto: SigninDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signin(dto);
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // Поменяйте на true в продакшене с HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: tokens.access_token };
  }

  // Выход
  @UseGuards(AtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    await this.authService.logout(user['sub']);
    res.clearCookie('refreshToken');
    return { message: 'Вы успешно вышли из системы' };
  }

  // Обновление токенов
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user;

    const tokens = await this.authService.refreshTokens(
      user['sub'],
      user['refreshToken'],
    );
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // Поменяйте на true в продакшене с HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return { access_token: tokens.access_token };
  }

  // OAuth 2.0 Google
  @Get('google')
  @UseGuards(GoogleGuard)
  async googleAuth() {
    // Этот метод перенаправляет пользователя на страницу аутентификации Google
  }

  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleAuthRedirect(
    @Req() req: Request & { user: { email: string; givenName: string } },
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.validateOAuthLogin(
      req.user.email,
      req.user.givenName,
      'google',
    );
    res.cookie('refreshToken', tokens.refresh_token, {
      httpOnly: true,
      secure: false, // Поменяйте на true в продакшене с HTTPS
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Перенаправляем на фронтенд с access_token в query параметре
    return res.redirect(
      `http://localhost:5173/oauth2/redirect?access_token=${tokens.access_token}`,
    );
  }
}
