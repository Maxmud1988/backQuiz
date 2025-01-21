// src/auth/strategies/rt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../types/jwtPayload.types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      secretOrKey: config.get<string>('jwt.refresh_secret'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }
    return { ...payload, refreshToken };
  }
}
