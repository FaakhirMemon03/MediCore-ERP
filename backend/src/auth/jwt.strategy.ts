import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'super-secret-jwt-key-replace-in-production',
    });
  }

  async validate(payload: any) {
    // If password change is required, prevent accessing normally guarded endpoints
    if (payload.mustChangePassword) {
      throw new UnauthorizedException('You must change your password before using this service.');
    }
    return { userId: payload.sub, username: payload.username, role: payload.role, storeId: payload.storeId };
  }
}
