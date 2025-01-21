import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('google.clientId'),
      clientSecret: config.get<string>('google.clientSecret'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
  ): Promise<any> {
    const email = profile.emails?.[0]?.value;
    const givenName = profile.name?.givenName;

    if (!email) {
      throw new Error('No email found in Google profile');
    }

    return { email, givenName };
  }
}
