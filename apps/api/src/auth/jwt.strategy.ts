import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const secret = process.env.JWT_SECRET || 'dev-secret';
    console.log('[JwtStrategy] Initializing with secret:', secret ? 'SET' : 'NOT SET');
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Validating payload:', { sub: payload.sub, email: payload.email, orgId: payload.orgId, roles: payload.roles });
    
    if (!payload.sub || !payload.email || !payload.orgId) {
      console.error('[JwtStrategy] Invalid payload - missing required fields');
      throw new UnauthorizedException('Invalid token payload');
    }
    
    // becomes req.user - include roles so they're available in guards/controllers
    return { 
      sub: payload.sub, 
      email: payload.email, 
      orgId: payload.orgId,
      roles: payload.roles || []
    };
  }
}
