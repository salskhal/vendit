import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionsService } from '../../sessions/sessions.service';
import { UsersService } from '../../users/users.service';

export interface JwtPayload {
  sub: string;
  username: string;
  role: string;
  jti: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
    private readonly sessionsService: SessionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const session = await this.sessionsService.findByJti(payload.jti);
    if (!session) throw new UnauthorizedException('Session expired or logged out');

    const user = await this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return Object.assign(user, { currentJti: payload.jti });
  }
}
