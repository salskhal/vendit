import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { SessionsService } from '../sessions/sessions.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionsService: SessionsService,
    private readonly config: ConfigService,
  ) {}

  async login(user: User) {
    const hasActive = await this.sessionsService.hasActiveSessions(user.id);

    const jti = uuidv4();
    const expiresIn = this.config.get<string>('JWT_EXPIRES_IN', '1d');
    const expiresAt = this.parseExpiry(expiresIn);

    const payload = { sub: user.id, username: user.username, role: user.role, jti };
    const access_token = this.jwtService.sign(payload);

    await this.sessionsService.create(user.id, jti, expiresAt);

    return {
      access_token,
      user: { id: user.id, username: user.username, role: user.role, deposit: user.deposit },
      ...(hasActive && { warning: 'There is already an active session using your account' }),
    };
  }

  async logout(jti: string): Promise<void> {
    await this.sessionsService.deactivate(jti);
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionsService.deactivateAll(userId);
  }

  private parseExpiry(expiresIn: string): Date {
    const now = new Date();
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(now.getTime() + 86400000);

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const ms = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[unit]!;
    return new Date(now.getTime() + value * ms);
  }
}
