import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
  ) {}

  async create(userId: string, jti: string, expiresAt: Date): Promise<Session> {
    const session = this.sessionRepo.create({ userId, jti, expiresAt });
    return this.sessionRepo.save(session);
  }

  async findByJti(jti: string): Promise<Session | null> {
    return this.sessionRepo.findOne({ where: { jti, isActive: true } });
  }

  async hasActiveSessions(userId: string): Promise<boolean> {
    const count = await this.sessionRepo.count({
      where: { userId, isActive: true, expiresAt: MoreThan(new Date()) },
    });
    return count > 0;
  }

  async deactivate(jti: string): Promise<void> {
    await this.sessionRepo.update({ jti }, { isActive: false });
  }

  async deactivateAll(userId: string): Promise<void> {
    await this.sessionRepo.update({ userId }, { isActive: false });
  }
}
