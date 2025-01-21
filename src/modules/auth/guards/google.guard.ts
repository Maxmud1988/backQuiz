// src/auth/guards/google.guard.ts
import { AuthGuard } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleGuard extends AuthGuard('google') {}
