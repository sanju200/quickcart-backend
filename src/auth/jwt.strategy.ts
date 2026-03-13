import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        configService: ConfigService,
        private userService: UserService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET', 'topSecret51'), // Fallback for dev
        });
    }

    async validate(payload: any) {
        // Fetch the user from the database to ensure we have the latest role
        // even if the token was issued before a role change.
        const user = await this.userService.findOne(payload.sub);
        if (!user) {
            return { userId: payload.sub, email: payload.email, role: payload.role };
        }
        return { userId: user.id, email: user.email, role: user.role };
    }
}
