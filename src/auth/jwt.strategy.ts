import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'topSecret51'), // Fallback for dev
        });
    }

    async validate(payload: any) {
        // Trust the JWT payload directly to avoid a DB query on every request.
        // The token already contains the role from when it was issued.
        // If a role change needs to take effect immediately, the user should re-login.
        return { userId: payload.sub, email: payload.email, role: payload.role };
    }
}

