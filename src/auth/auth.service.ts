import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto, SignupDto } from '../dto/auth.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userService.findByEmail(email);
        if (user && user.password_hash) {
            const isMatch = await bcrypt.compare(pass, user.password_hash);
            if (isMatch) {
                const { password_hash, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async findUserByEmail(email: string) {
        return this.userService.findByEmail(email);
    }

    async login(loginDto: LoginDto) {
        const user = await this.userService.findByEmail(loginDto.email);
        
        if (!user) {
            throw new UnauthorizedException({
                message: "This email isn't registered. Please check again or sign up.",
                code: 'USER_NOT_FOUND',
                field: 'email'
            });
        }

        if (user.password_hash) {
            const isMatch = await bcrypt.compare(loginDto.password, user.password_hash);
            if (!isMatch) {
                throw new UnauthorizedException({
                    message: 'The password you entered is incorrect. Please try again.',
                    code: 'INVALID_PASSWORD',
                    field: 'password'
                });
            }
        } else {
             // Handle users without a password hash (e.g. social login users)
             throw new UnauthorizedException({
                message: 'This account uses a different login method.',
                code: 'SOCIAL_LOGIN_ONLY',
                field: 'password'
             });
        }

        const { password_hash, ...result } = user;
        const payload = { email: user.email, sub: user.id, role: user.role };
        
        return {
            access_token: this.jwtService.sign(payload),
            user: result,
        };
    }

    async signup(signupDto: SignupDto) {
        const existingUser = await this.userService.findByEmail(signupDto.email);
        if (existingUser) {
            throw new ConflictException({
                message: 'This email is already in use. Try logging in instead.',
                code: 'EMAIL_ALREADY_EXISTS',
                field: 'email'
            });
        }
        const user = await this.userService.create({
            firstName: signupDto.firstName,
            lastName: signupDto.lastName,
            email: signupDto.email,
            phone: signupDto.phone,
            password: signupDto.password,
            role: signupDto.role,
        });

        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }
}
