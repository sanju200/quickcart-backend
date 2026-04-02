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
        let fName = signupDto.firstName;
        let lName = signupDto.lastName;

        if (signupDto.name && (!fName || !lName)) {
            const parts = signupDto.name.trim().split(/\s+/);
            fName = parts[0];
            lName = parts.slice(1).join(' ') || '';
        }

        const user = await this.userService.create({
            firstName: fName || '',
            lastName: lName || '',
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
