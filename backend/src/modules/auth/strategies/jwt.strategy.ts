import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    const opts: StrategyOptionsWithRequest = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') as string,
      passReqToCallback: true,
    };
    super(opts);
  }

  async validate(req: Request, payload: { id: string }) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token && (await this.redis.isBlacklisted(token))) {
      throw new UnauthorizedException('Token has been invalidated. Please log in again.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, vendorId: true, isDeleted: true },
    });

    if (!user || user.isDeleted) throw new UnauthorizedException('User not found or deactivated');

    // Attach token to request for logout use
    (req as any).token = token;
    return user;
  }
}
