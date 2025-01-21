import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, GoogleStrategy, RtStrategy } from './strategies';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    JwtModule.register({}), // Конфигурация будет перенесена в стратегии
    ConfigModule,
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy, GoogleStrategy],
})
export class AuthModule {}
